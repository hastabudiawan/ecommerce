CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL UNIQUE,
    description TEXT,
    city VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_stores_seller_id ON stores(seller_id);