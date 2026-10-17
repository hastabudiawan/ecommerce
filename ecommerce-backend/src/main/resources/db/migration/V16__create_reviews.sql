CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_reviews_product_user UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);

ALTER TABLE products ADD COLUMN rating_average NUMERIC(2,1) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN review_count INT NOT NULL DEFAULT 0;