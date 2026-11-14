-- Inventory schema and reporting queries.
/* Block comment:
   PostgreSQL dialect. */

CREATE SCHEMA IF NOT EXISTS inventory;

CREATE TYPE inventory.status AS ENUM ('draft', 'active', 'archived');

CREATE TABLE IF NOT EXISTS inventory.products (
    id          BIGSERIAL PRIMARY KEY,
    sku         VARCHAR(10) NOT NULL UNIQUE CHECK (sku ~ '^[A-Z]{3}-\d{4,6}$'),
    name        TEXT NOT NULL,
    price       NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status      inventory.status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_status ON inventory.products (status) WHERE status <> 'archived';

INSERT INTO inventory.products (sku, name, price, status, is_featured)
VALUES
    ('ABC-1234', 'Widget', 99.50, 'active', TRUE),
    ('XYZ-0001', 'O''Brien''s gadget', 1.5e2, 'draft', FALSE)
ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price;

WITH monthly AS (
    SELECT
        date_trunc('month', o.created_at) AS month,
        p.sku,
        SUM(l.quantity * p.price) AS revenue,
        COUNT(DISTINCT o.id) AS orders
    FROM inventory.orders AS o
    INNER JOIN inventory.order_lines AS l ON l.order_id = o.id
    LEFT JOIN inventory.products AS p ON p.id = l.product_id
    WHERE o.created_at >= now() - INTERVAL '6 months'
      AND p.status IN ('active', 'draft')
      AND p.name ILIKE '%widget%'
    GROUP BY 1, 2
    HAVING SUM(l.quantity) > 10
)
SELECT
    month,
    sku,
    revenue,
    ROUND(revenue / NULLIF(orders, 0), 2) AS avg_order,
    RANK() OVER (PARTITION BY month ORDER BY revenue DESC) AS position,
    CASE
        WHEN revenue >= 10000 THEN 'high'
        WHEN revenue BETWEEN 1000 AND 9999 THEN 'medium'
        ELSE 'low'
    END AS tier,
    COALESCE(metadata ->> 'colour', 'n/a') AS colour
FROM monthly
ORDER BY month DESC, position ASC
LIMIT 50 OFFSET 0;

CREATE OR REPLACE FUNCTION inventory.touch() RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at := COALESCE(NEW.created_at, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

BEGIN;
UPDATE inventory.products SET status = 'archived' WHERE price IS NULL OR price = 0;
DELETE FROM inventory.products WHERE status = 'archived' AND created_at < '2020-01-01';
COMMIT;
