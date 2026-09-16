/*
  Warnings:

  - A unique constraint covering the columns `[kode_penukaran]` on the table `penukaran_poin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_nasabah` to the `penukaran_poin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kode_penukaran` to the `penukaran_poin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "penukaran_poin" DROP CONSTRAINT "penukaran_poin_id_setor_fkey";

-- AlterTable
ALTER TABLE "penukaran_poin" ADD COLUMN     "id_nasabah" UUID NOT NULL,
ADD COLUMN     "kode_penukaran" VARCHAR(30) NOT NULL,
ALTER COLUMN "tanggal" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id_setor" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'diproses';

-- CreateIndex
CREATE UNIQUE INDEX "penukaran_poin_kode_penukaran_key" ON "penukaran_poin"("kode_penukaran");

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_id_nasabah_fkey" FOREIGN KEY ("id_nasabah") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_id_setor_fkey" FOREIGN KEY ("id_setor") REFERENCES "setor_sampah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
