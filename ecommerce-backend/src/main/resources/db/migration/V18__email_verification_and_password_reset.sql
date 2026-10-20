-- DEFAULT true: semua akun yang sudah ada, dan akun yang dibuat lewat jalur lain (seed, admin),
-- dianggap terverifikasi. Hanya pendaftaran mandiri yang akan diset false oleh kode.
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP;

CREATE TABLE email_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_tokens_user_type ON email_tokens(user_id, type);