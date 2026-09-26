ALTER TABLE products
    ADD COLUMN store_id BIGINT REFERENCES stores(id),
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN rejection_reason TEXT;

CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_status ON products(status);