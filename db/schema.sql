-- =====================================================================
-- demo.orders_raw
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS demo;

DROP TABLE IF EXISTS demo.orders_raw;

CREATE TABLE demo.orders_raw (
    id                TEXT PRIMARY KEY,
    customer_email    TEXT,
    product_category  TEXT,
    quantity          INTEGER,        -- was TEXT (anti-pattern: numeric as text)
    price             NUMERIC(12,2),  -- was TEXT (anti-pattern: numeric as text)
    status            TEXT,
    order_date        DATE            -- was TEXT (anti-pattern: date as text)
);

-- Indexes to support range and equality filters without sequential scans
CREATE INDEX ON demo.orders_raw (order_date);
CREATE INDEX ON demo.orders_raw (customer_email);
CREATE INDEX ON demo.orders_raw (status);

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
