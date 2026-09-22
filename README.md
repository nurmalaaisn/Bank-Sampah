# Bank Sampah API

RESTful API untuk Sistem Bank Sampah Digital yang dibuat menggunakan NestJS.
API ini menyediakan fitur untuk pengelolaan nasabah, kategori sampah, setoran
sampah, poin, hadiah, dan penukaran poin.

Project ini dibuat sebagai bagian dari implementasi UKK RPL 2026/2027.

---

## 1. Teknologi yang Digunakan

- **NestJS** - Framework backend Node.js
- **TypeScript** - Bahasa pemrograman
- **PostgreSQL** - Database relasional
- **Prisma ORM** - Pengelolaan database dan migration
- **JWT (JSON Web Token)** - Autentikasi pengguna
- **bcrypt** - Hashing password
- **Cloudinary** - Penyimpanan foto/gambar
- **Swagger** - Dokumentasi dan pengujian API
- **Postman** - Pengujian endpoint API
- **Railway** - Deployment aplikasi dan PostgreSQL

---

## 2. Fitur Utama

### Autentikasi

- Registrasi nasabah
- Registrasi admin bank sampah
- Login admin dan nasabah
- Mendapatkan profile pengguna yang sedang login
- Autentikasi menggunakan JWT
- Password disimpan dalam bentuk hash menggunakan bcrypt

### Nasabah

- Melihat data profile
- Melihat kategori sampah
- Melakukan setoran sampah
- Melihat status setoran
- Melihat saldo poin
- Melihat riwayat poin
- Melakukan penukaran poin
- Melihat riwayat penukaran poin

### Admin Bank Sampah

- Mengelola data nasabah
- Menambahkan nasabah
- Mengubah data nasabah
- Menghapus data nasabah
- Melihat daftar nasabah
- Mengelola kategori sampah
- Menambahkan kategori sampah
- Mengubah kategori sampah
- Menghapus kategori sampah
- Menentukan harga sampah per kilogram
- Menentukan poin per kilogram
- Mengelola data hadiah
- Menambahkan hadiah
- Mengubah hadiah
- Menghapus hadiah
- Melakukan verifikasi setoran sampah
- Mengelola proses transaksi setoran dan penukaran poin

### Upload Foto

Foto dapat disimpan menggunakan Cloudinary untuk:

- Foto nasabah
- Foto kategori sampah
- Foto hadiah

Format foto yang diperbolehkan:

- JPG
- JPEG
- PNG
- WEBP

Ukuran maksimal:

- 10 MB

---

## 3. Struktur Project

```text
bank-sampah/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── auth/
│   ├── common/
│   │   ├── cloudinary/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── multer/
│   │
│   ├── dashboard/
│   ├── hadiah/
│   ├── kategori-sampah/
│   ├── nasabah/
│   ├── penukaran-poin/
│   ├── prisma/
│   ├── rekapitulasi/
│   ├── seed/
│   └── setor-sampah/
│
├── .env
├── .env.example
├── prisma7.config.ts
├── package.json
├── tsconfig.json
└── README.md

## Menjalankan Project

npm install

npx prisma generate

npm run start:dev

## URL Local
http://localhost:3000

## Swagger
http://localhost:3000/api/docs

## URL Production
https://bank-sampah-production-9e28.up.railway.app

## Swagger Production
https://bank-sampah-production-9e28.up.railway.app/api/docs