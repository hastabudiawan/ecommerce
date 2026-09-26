CREATE TABLE settlements (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id),
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id),
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    released_at TIMESTAMP
);

CREATE INDEX idx_settlements_store_id ON settlements(store_id);
CREATE INDEX idx_settlements_status ON settlements(status);