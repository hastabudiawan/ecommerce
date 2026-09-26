ALTER TABLE orders
    ADD COLUMN store_id BIGINT REFERENCES stores(id),
    ADD COLUMN order_group_id BIGINT REFERENCES order_groups(id);

CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_order_group_id ON orders(order_group_id);