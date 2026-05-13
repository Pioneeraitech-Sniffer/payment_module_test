import { OrdersService } from './orders.service';

// Minimal mock of pg.Pool.query: captures the last SQL + params so tests can
// assert the generated query without a live database.
function makeMockPool(rows: Record<string, unknown>[] = []) {
  const calls: { sql: string; params: unknown[] }[] = [];
  const pool = {
    query: jest.fn(async (sql: string, params: unknown[] = []) => {
      calls.push({ sql, params });
      return { rows };
    }),
    _calls: calls,
  };
  return pool;
}

describe('OrdersService', () => {
  describe('statsByDate', () => {
    it('uses direct column comparison (no column-side CAST) for order_date', async () => {
      const pool = makeMockPool([]);
      const service = new OrdersService(pool as any);

      await service.statsByDate('2026-01-01', '2026-03-31');

      const { sql } = pool._calls[0];
      // Must NOT wrap order_date in CAST(...)
      expect(sql).not.toMatch(/CAST\s*\(\s*order_date/i);
      // Must use the direct BETWEEN pattern
      expect(sql).toMatch(/order_date\s+BETWEEN\s+\$1::date\s+AND\s+\$2::date/i);
    });

    it('uses native column arithmetic — no CAST on price or quantity', async () => {
      const pool = makeMockPool([]);
      const service = new OrdersService(pool as any);

      await service.statsByDate('2026-01-01', '2026-12-31');

      const { sql } = pool._calls[0];
      expect(sql).not.toMatch(/CAST\s*\(\s*price/i);
      expect(sql).not.toMatch(/CAST\s*\(\s*quantity/i);
      expect(sql).toMatch(/SUM\s*\(\s*quantity\s*\)/i);
      expect(sql).toMatch(/SUM\s*\(\s*price\s*\*\s*quantity\s*\)/i);
    });

    it('passes from/to as query parameters and returns them in the response', async () => {
      const mockRows = [
        { product_category: 'books', line_items: '2', units: '3', revenue: '32.49' },
      ];
      const pool = makeMockPool(mockRows);
      const service = new OrdersService(pool as any);

      const result = await service.statsByDate('2026-01-01', '2026-03-31');

      expect(pool._calls[0].params).toEqual(['2026-01-01', '2026-03-31']);
      expect(result.from).toBe('2026-01-01');
      expect(result.to).toBe('2026-03-31');
      expect(result.categories).toEqual(mockRows);
    });
  });

  describe('stats', () => {
    it('uses native column arithmetic — no CAST on price or quantity', async () => {
      const pool = makeMockPool([]);
      const service = new OrdersService(pool as any);

      await service.stats('paid');

      const { sql } = pool._calls[0];
      expect(sql).not.toMatch(/CAST\s*\(\s*price/i);
      expect(sql).not.toMatch(/CAST\s*\(\s*quantity/i);
      expect(sql).toMatch(/SUM\s*\(\s*quantity\s*\)/i);
      expect(sql).toMatch(/SUM\s*\(\s*price\s*\*\s*quantity\s*\)/i);
    });

    it('includes WHERE clause when status is provided', async () => {
      const pool = makeMockPool([]);
      const service = new OrdersService(pool as any);

      await service.stats('paid');

      const { sql, params } = pool._calls[0];
      expect(sql).toMatch(/WHERE\s+status\s*=\s*\$1/i);
      expect(params).toEqual(['paid']);
    });

    it('omits WHERE clause when status is undefined', async () => {
      const pool = makeMockPool([]);
      const service = new OrdersService(pool as any);

      await service.stats(undefined);

      const { sql, params } = pool._calls[0];
      expect(sql).not.toMatch(/WHERE/i);
      expect(params).toEqual([]);
    });
  });
});
