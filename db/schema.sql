-- =====================================================================
-- demo.orders_raw
--
-- INTENTIONALLY BAD SCHEMA. Used as a teaching/demo target for an AI
-- assistant to spot and fix later. Do not "clean this up" without
-- coordinating with the demo script.
--
-- Mistakes baked in on purpose:
--   1. Every column is TEXT — including numerics AND the date field
--      (order_date). Any query that needs to compare, sort, sum, or
--      range-filter must CAST on every row.
--   2. No supporting indexes on the columns we actually filter by:
--      customer_email, status, product_category, order_date.
--      Only the PK on id exists, so every realistic query is a Seq Scan.
--   3. No NOT NULL / CHECK constraints — bad data can land in any column.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS demo;

DROP TABLE IF EXISTS demo.orders_raw;

CREATE TABLE demo.orders_raw (
    id                TEXT PRIMARY KEY,
    customer_email    TEXT,
    product_category  TEXT,
    quantity          TEXT,   -- should be INTEGER
    price             TEXT,   -- should be NUMERIC(12,2)
    status            TEXT,
    order_date        TEXT    -- should be DATE / TIMESTAMPTZ
);

-- NOTE: deliberately NO indexes on customer_email, status,
-- product_category, or order_date. Leave these missing so the AI
-- assistant can identify them later.

INSERT INTO demo.orders_raw (id, customer_email, product_category, quantity, price, status, order_date) VALUES
    ('1',  'alice@example.com',   'books',       '2',  '19.99',  'paid',     '2026-01-04'),
    ('2',  'bob@example.com',     'electronics', '1',  '799.00', 'paid',     '2026-01-08'),
    ('3',  'carol@example.com',   'books',       '5',  '12.50',  'refunded', '2026-02-01'),
    ('4',  'dan@example.com',     'apparel',     '3',  '45.00',  'paid',     '2026-02-14'),
    ('5',  'erin@example.com',    'electronics', '2',  '149.99', 'pending',  '2026-03-03'),
    ('6',  'frank@example.com',   'books',       '1',  '9.99',   'paid',     '2026-03-22'),
    ('7',  'grace@example.com',   'apparel',     '4',  '29.95',  'paid',     '2026-04-01'),
    ('8',  'heidi@example.com',   'electronics', '1',  '1299.00','paid',     '2026-04-18'),
    ('9',  'ivan@example.com',    'books',       '2',  '24.00',  'refunded', '2026-05-02'),
    ('10', 'judy@example.com',    'apparel',     '6',  '15.75',  'pending',  '2026-05-10');
