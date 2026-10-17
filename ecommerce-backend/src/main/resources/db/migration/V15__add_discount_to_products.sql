ALTER TABLE products ADD COLUMN discount_percent INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD CONSTRAINT chk_products_discount CHECK (discount_percent BETWEEN 0 AND 90);

ALTER TABLE products ADD COLUMN final_price NUMERIC(12,2);
UPDATE products SET final_price = price;
ALTER TABLE products ALTER COLUMN final_price SET NOT NULL;