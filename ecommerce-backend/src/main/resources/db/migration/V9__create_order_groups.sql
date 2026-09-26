CREATE TABLE order_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    address_id BIGINT NOT NULL REFERENCES addresses(id),
    group_number VARCHAR(30) NOT NULL UNIQUE,
    subtotal NUMERIC(12,2) NOT NULL,
    shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_groups_user_id ON order_groups(user_id);