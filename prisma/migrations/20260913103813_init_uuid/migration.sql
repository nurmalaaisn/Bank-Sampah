-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin_bank', 'nasabah');

-- CreateEnum
CREATE TYPE "JenisSampah" AS ENUM ('plastik', 'kertas', 'logam', 'kaca');

-- CreateEnum
CREATE TYPE "StatusSetor" AS ENUM ('belum_dikonfirmasi', 'diproses', 'selesai', 'ditolak');

-- CreateEnum
CREATE TYPE "StatusPenukaran" AS ENUM ('diproses', 'selesai');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "app_maker_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "id" UUID NOT NULL,
    "nama_nasabah" VARCHAR(100) NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "saldo_poin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "id_user" UUID NOT NULL,
    "foto" VARCHAR(255),
    "tanggal_lahir" TIMESTAMP(3),

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bank" (
    "id" UUID NOT NULL,
    "nama_unit" VARCHAR(100) NOT NULL,
    "nama_pengelola" VARCHAR(100) NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "id_user" UUID NOT NULL,

    CONSTRAINT "admin_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_sampah" (
    "id" UUID NOT NULL,
    "nama_kategori" VARCHAR(100) NOT NULL,
    "harga_per_kg" DOUBLE PRECISION NOT NULL,
    "poin_per_kg" DOUBLE PRECISION NOT NULL,
    "jenis" "JenisSampah" NOT NULL,
    "foto" VARCHAR(255),
    "app_maker_id" UUID,

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setor_sampah" (
    "id" UUID NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "id_admin" UUID NOT NULL,
    "id_nasabah" UUID NOT NULL,
    "status" "StatusSetor" NOT NULL,

    CONSTRAINT "setor_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_setor" (
    "id" UUID NOT NULL,
    "id_setor" UUID NOT NULL,
    "id_kategori_sampah" UUID NOT NULL,
    "berat_kg" DOUBLE PRECISION NOT NULL,
    "subtotal_poin" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "detail_setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hadiah" (
    "id" UUID NOT NULL,
    "nama_hadiah" VARCHAR(100) NOT NULL,
    "poin_dibutuhkan" DOUBLE PRECISION NOT NULL,
    "stok" INTEGER NOT NULL,
    "foto" VARCHAR(255),
    "app_maker_id" UUID,

    CONSTRAINT "hadiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penukaran_poin" (
    "id" UUID NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "id_setor" UUID NOT NULL,
    "id_hadiah" UUID NOT NULL,
    "poin_terpakai" DOUBLE PRECISION NOT NULL,
    "status" "StatusPenukaran" NOT NULL,

    CONSTRAINT "penukaran_poin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_maker" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "nama_siswa" VARCHAR(100) NOT NULL,
    "kelas" VARCHAR(50) NOT NULL,
    "nama_app" VARCHAR(100) NOT NULL,
    "app_key" VARCHAR(100) NOT NULL,

    CONSTRAINT "app_maker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_app_maker_id_key" ON "users"("username", "app_maker_id");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_id_user_key" ON "nasabah"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bank_id_user_key" ON "admin_bank"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "app_maker_email_key" ON "app_maker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_maker_app_key_key" ON "app_maker"("app_key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_app_maker_id_fkey" FOREIGN KEY ("app_maker_id") REFERENCES "app_maker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "nasabah_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bank" ADD CONSTRAINT "admin_bank_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kategori_sampah" ADD CONSTRAINT "kategori_sampah_app_maker_id_fkey" FOREIGN KEY ("app_maker_id") REFERENCES "app_maker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_id_nasabah_fkey" FOREIGN KEY ("id_nasabah") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_id_kategori_sampah_fkey" FOREIGN KEY ("id_kategori_sampah") REFERENCES "kategori_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_id_setor_fkey" FOREIGN KEY ("id_setor") REFERENCES "setor_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hadiah" ADD CONSTRAINT "hadiah_app_maker_id_fkey" FOREIGN KEY ("app_maker_id") REFERENCES "app_maker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_id_hadiah_fkey" FOREIGN KEY ("id_hadiah") REFERENCES "hadiah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_id_setor_fkey" FOREIGN KEY ("id_setor") REFERENCES "setor_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
