import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';

@Injectable()
export class OrdersService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // Intentionally unoptimized: no LIMIT, returns the whole table.
  async listAll() {
    const started = Date.now();
    const { rows } = await this.pool.query(
      `SELECT * FROM demo.orders_raw`,
    );
    return {
      count: rows.length,
      elapsed_ms: Date.now() - started,
      rows,
    };
  }

  // Intentionally unoptimized: customer_email has no index, full scan.
  async searchByEmail(email: string) {
    const started = Date.now();
    const { rows } = await this.pool.query(
      `SELECT * FROM demo.orders_raw WHERE customer_email = $1`,
      [email],
    );
    return {
      count: rows.length,
      elapsed_ms: Date.now() - started,
      rows,
    };
  }

  // Intentionally unoptimized: numerics are stored as TEXT so every
  // row has to be CAST, and there is no index to support the filter.
  async stats(status?: string) {
    const started = Date.now();
    const where = status ? `WHERE status = $1` : ``;
    const params = status ? [status] : [];
    const { rows } = await this.pool.query(
      `
      SELECT
        product_category,
        COUNT(*)                                                          AS line_items,
        SUM(CAST(quantity AS NUMERIC))                                    AS units,
        ROUND(
          SUM(CAST(price AS NUMERIC) * CAST(quantity AS NUMERIC))::numeric,
          2
        )                                                                 AS revenue
      FROM demo.orders_raw
      ${where}
      GROUP BY product_category
      ORDER BY revenue DESC NULLS LAST
      `,
      params,
    );
    return {
      filter: status ?? 'all',
      elapsed_ms: Date.now() - started,
      categories: rows,
    };
  }
}
