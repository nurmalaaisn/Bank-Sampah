/*
  Warnings:

  - The values [belum_dikonfirmasi,diproses] on the enum `StatusSetor` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[kode_setor]` on the table `setor_sampah` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kode_setor` to the `setor_sampah` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_berat_kg` to the `setor_sampah` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_poin` to the `setor_sampah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusSetor_new" AS ENUM ('menunggu_konfirmasi', 'diverifikasi', 'selesai', 'ditolak');
ALTER TABLE "setor_sampah" ALTER COLUMN "status" TYPE "StatusSetor_new" USING ("status"::text::"StatusSetor_new");
ALTER TYPE "StatusSetor" RENAME TO "StatusSetor_old";
ALTER TYPE "StatusSetor_new" RENAME TO "StatusSetor";
DROP TYPE "public"."StatusSetor_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "setor_sampah" DROP CONSTRAINT "setor_sampah_id_admin_fkey";

-- AlterTable
ALTER TABLE "setor_sampah" ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "catatan_admin" TEXT,
ADD COLUMN     "kode_setor" VARCHAR(30) NOT NULL,
ADD COLUMN     "total_berat_kg" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_poin" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id_admin" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'menunggu_konfirmasi';

-- CreateIndex
CREATE UNIQUE INDEX "setor_sampah_kode_setor_key" ON "setor_sampah"("kode_setor");

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin_bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
