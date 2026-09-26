# E-Commerce Backend — Spring Boot

Backend REST API untuk platform e-commerce marketplace multi-vendor, dibangun dengan Spring Boot. Mendukung autentikasi berbasis JWT, manajemen produk, keranjang belanja, checkout multi-seller, sistem toko untuk penjual, workflow approval produk, settlement pendapatan seller, dan upload gambar produk ke cloud storage.

---

## Fitur Utama

- **Autentikasi & Otorisasi** — JWT-based auth dengan role `ADMIN`, `CUSTOMER`, dan `SELLER`; token blacklist untuk logout yang sesungguhnya
- **Manajemen Produk** — CRUD produk dengan pagination, sorting, dan pencarian
- **Keranjang Belanja** — tambah/update/hapus item dengan validasi stok real-time
- **Alamat Pengiriman** — manajemen alamat per user
- **Order & Checkout** — konversi cart menjadi order dengan snapshot harga
- **Marketplace Multi-Vendor**
  - Seller memiliki toko sendiri
  - Produk dari seller melalui alur approval admin sebelum tampil publik
  - Checkout otomatis memecah order berdasarkan toko (order splitting)
  - Seller mengelola status fulfillment order tokonya sendiri
- **Settlement** — pencatatan pendapatan seller setelah order selesai, dengan mekanisme pencairan oleh admin
- **Upload Gambar Produk** — terintegrasi dengan Cloudinary

> **Catatan:** Integrasi payment gateway (Midtrans) sempat diimplementasikan namun untuk saat ini dinonaktifkan/pending karena kendala aktivasi akun. Status order saat ini dikelola manual oleh admin/seller melalui endpoint update status.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Spring Boot 4.1.0 |
| Bahasa | Java 25 |
| Database | PostgreSQL |
| Migration | Flyway |
| Autentikasi | Spring Security + JWT (jjwt) |
| Build Tool | Maven |
| Cloud Storage | Cloudinary |
| Password Hashing | BCrypt |

---

## Prasyarat

Pastikan sudah terinstall di sistem kamu:

- **JDK 21 atau lebih tinggi** (project dikembangkan dengan Java 25, tapi kompatibel ke bawah selama target release `25` bisa dipenuhi compiler yang dipakai)
- **Maven 3.9+** (opsional — project sudah menyertakan Maven Wrapper `./mvnw`)
- **PostgreSQL 15+**
- **Akun Cloudinary** (gratis) — untuk fitur upload gambar produk

---

## Instalasi

### 1. Clone repository

```bash
git clone <url-repository-ini>
cd ecommerce-backend
```

### 2. Beri izin eksekusi ke Maven Wrapper (macOS/Linux)

```bash
chmod +x mvnw
```

> Windows tidak memerlukan langkah ini — gunakan `mvnw.cmd` atau `./mvnw` langsung.

### 3. Setup database PostgreSQL

Buat database dan user khusus untuk project ini:

```sql
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'ganti_dengan_password_kuat';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

**Khusus PostgreSQL 15 ke atas**, jalankan tambahan ini agar user memiliki privilege ke schema `public` (dibutuhkan Flyway untuk membuat tabel):

```sql
\c ecommerce_db
GRANT ALL ON SCHEMA public TO ecommerce_user;
```

Perintah di atas bisa dijalankan lewat `psql`, pgAdmin (Query Tool), atau GUI client PostgreSQL lain.

<details>
<summary><strong>Alternatif: Setup lewat pgAdmin (GUI)</strong></summary>

Kalau lebih nyaman pakai antarmuka visual daripada command line:

1. Buka pgAdmin, pastikan sudah terhubung ke server PostgreSQL lokal (`localhost:5432`).
2. **Buat database:** klik kanan **Databases** → **Create → Database**. Isi Name: `ecommerce_db`, lalu Save.
3. **Buat user:** klik kanan **Login/Group Roles** → **Create → Login/Group Role**.
   - Tab **General**: Name → `ecommerce_user`
   - Tab **Definition**: Password → isi password yang kuat
   - Tab **Privileges**: aktifkan toggle **Can login?**
   - Save
4. **Berikan privilege ke database:** klik kanan `ecommerce_db` → **Properties** → tab **Security** → klik **+** pada Privileges → Grantee: `ecommerce_user` → centang semua (**ALL**) → Save.
5. **Berikan privilege ke schema public** (wajib untuk PostgreSQL 15+): expand `ecommerce_db` → **Schemas** → klik kanan `public` → **Properties** → tab **Security** → **+** → Grantee: `ecommerce_user` → centang **ALL** → Save.

Cara lebih cepat: klik kanan `ecommerce_db` → **Query Tool**, lalu jalankan langsung SQL dari langkah 3 di atas (`CREATE USER`, `GRANT ALL PRIVILEGES`, `GRANT ALL ON SCHEMA public`) — hasilnya sama dengan klik-klik manual, tapi lebih cepat.

</details>

### 4. Setup akun Cloudinary

1. Daftar gratis di [cloudinary.com](https://cloudinary.com/users/register/free)
2. Buka Dashboard, catat tiga nilai berikut:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (klik ikon mata untuk menampilkan, atau buka menu **Settings → API Keys**)

### 5. Konfigurasi `application.yml`

Buat/edit file `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: ecommerce-backend

  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce_db
    username: ecommerce_user
    password: ${DB_PASSWORD:ganti_dengan_password_kuat}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB

cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:isi-cloud-name-kamu}
  api-key: ${CLOUDINARY_API_KEY:isi-api-key-kamu}
  api-secret: ${CLOUDINARY_API_SECRET:isi-api-secret-kamu}

server:
  port: 8080

logging:
  level:
    org.hibernate.SQL: debug

jwt:
  secret: ${JWT_SECRET:ganti-dengan-string-acak-minimal-256-bit}
  expiration-ms: 86400000   # 24 jam
```

**Penting soal keamanan:**
- Jangan commit `application.yml` dengan value asli (password database, JWT secret, Cloudinary credentials) ke repository publik. Gunakan environment variable (format `${NAMA_ENV:default}` di atas sudah mendukung ini) untuk deployment sungguhan.
- Generate JWT secret yang kuat, misal lewat: `openssl rand -base64 32`

### 6. Jalankan aplikasi

```bash
./mvnw spring-boot:run
```

Jika berhasil, Flyway akan otomatis menjalankan seluruh migration (schema + seed data awal seperti daftar role), dan aplikasi berjalan di `http://localhost:8080`.

---

## Akun Default (Auto-Seeded)

Aplikasi secara otomatis membuat 3 akun default saat pertama kali dijalankan pada database kosong (lihat `DataSeeder.java`, aktif hanya di luar profile `production`):

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@example.com | password123 |
| CUSTOMER | customer@example.com | password123 |
| SELLER | seller@example.com | password123 |

Password default bisa diubah lewat environment variable `SEED_ADMIN_PASSWORD` (jika dikonfigurasi) atau langsung di kode seeder.

---

## Struktur Project

Struktur mengikuti pola **package-by-feature** — setiap modul punya sub-package `controller`, `service`, `repository`, `entity`, `dto` sendiri:

```
src/main/java/com/hasta/ecommerce/
├── config/          # Security, Cloudinary, dan konfigurasi lainnya
├── security/         # JWT provider, filter, token blacklist
├── common/           # Response wrapper, exception handler, utilitas
├── auth/              # Register, login, logout
├── user/              # User & alamat
├── product/          # Produk, kategori, approval
├── store/             # Toko milik seller
├── cart/               # Keranjang belanja
├── order/             # Order, order group (splitting)
├── settlement/     # Pencatatan pendapatan seller
└── EcommerceBackendApplication.java
```

---

## Endpoint Utama

Ringkasan endpoint (lihat kode controller masing-masing modul untuk detail lengkap):

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | Publik | Registrasi user baru |
| POST | `/api/auth/login` | Publik | Login, menghasilkan JWT |
| POST | `/api/auth/logout` | Autentikasi | Logout (blacklist token) |
| GET | `/api/products` | Publik | Katalog produk (hanya status APPROVED) |
| POST | `/api/products` | ADMIN | Buat produk platform |
| POST | `/api/products/seller` | SELLER | Ajukan produk baru (status PENDING) |
| PUT | `/api/products/{id}/approve` | ADMIN | Setujui produk seller |
| PUT | `/api/products/{id}/reject` | ADMIN | Tolak produk seller |
| POST | `/api/products/{id}/images` | ADMIN/SELLER | Upload gambar produk |
| POST/GET | `/api/cart/items`, `/api/cart` | Autentikasi | Kelola keranjang |
| POST | `/api/addresses` | Autentikasi | Kelola alamat |
| POST | `/api/orders/checkout` | Autentikasi | Checkout (dengan order splitting) |
| GET | `/api/orders/seller` | SELLER | Order milik toko seller |
| PUT | `/api/orders/seller/{id}/status` | SELLER | Update status fulfillment |
| POST | `/api/seller/store` | SELLER | Buat toko |
| GET | `/api/seller/settlements` | SELLER | Riwayat settlement |
| PUT | `/api/admin/settlements/{id}/release` | ADMIN | Cairkan settlement |

---

## Testing

Project ini telah diuji secara manual menyeluruh menggunakan Postman, mencakup:
- Alur autentikasi lengkap (register, login, logout, role-based access)
- CRUD produk dengan validasi dan proteksi kepemilikan (IDOR protection)
- Alur keranjang belanja dan checkout multi-seller
- Workflow approval produk dan settlement seller
- Upload/hapus gambar produk

> Unit test otomatis (JUnit + Testcontainers) belum diimplementasikan — merupakan rencana pengembangan lanjutan.

---

## Rencana Pengembangan Lanjutan

- [ ] Reaktivasi integrasi payment gateway (Midtrans)
- [ ] Unit & integration testing (JUnit 5, Mockito, Testcontainers)
- [ ] Containerization (Docker + Docker Compose)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] API documentation (Swagger/OpenAPI)

---

## Lisensi

Project ini dibuat untuk keperluan portfolio dan pembelajaran.
