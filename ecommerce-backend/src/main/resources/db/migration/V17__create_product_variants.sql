CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    color_name VARCHAR(50),
    color_hex VARCHAR(7),
    size VARCHAR(20),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_variant_has_attribute CHECK (color_name IS NOT NULL OR size IS NOT NULL)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Satu kombinasi warna+ukuran hanya boleh sekali per produk (huruf besar-kecil dianggap sama)
CREATE UNIQUE INDEX uq_product_variants_combo
    ON product_variants (product_id, COALESCE(lower(color_name), ''), COALESCE(lower(size), ''));

-- Keranjang: pilihan varian. Kalau variannya dihapus, item keranjang ikut terhapus.
ALTER TABLE cart_items ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE;

-- Aturan lama "satu produk satu baris per keranjang" diganti "satu produk+varian satu baris".
-- Nama constraint lama dibuat otomatis oleh PostgreSQL; cek dengan \d cart_items kalau perintah ini gagal.
ALTER TABLE cart_items DROP CONSTRAINT cart_items_cart_id_product_id_key;
CREATE UNIQUE INDEX uq_cart_items_product_variant
    ON cart_items (cart_id, product_id, COALESCE(variant_id, 0));

-- Pesanan: varian yang dibeli, plus salinan labelnya. Kalau variannya dihapus, tautannya jadi NULL
-- tapi label tetap ada.
ALTER TABLE order_items ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL;
ALTER TABLE order_items ADD COLUMN variant_label VARCHAR(100);