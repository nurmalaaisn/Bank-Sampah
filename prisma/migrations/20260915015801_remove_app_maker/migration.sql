/*
  Warnings:

  - You are about to drop the column `app_maker_id` on the `hadiah` table. All the data in the column will be lost.
  - You are about to drop the column `app_maker_id` on the `kategori_sampah` table. All the data in the column will be lost.
  - You are about to drop the column `app_maker_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `app_maker` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "hadiah" DROP CONSTRAINT "hadiah_app_maker_id_fkey";

-- DropForeignKey
ALTER TABLE "kategori_sampah" DROP CONSTRAINT "kategori_sampah_app_maker_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_app_maker_id_fkey";

-- DropIndex
DROP INDEX "users_username_app_maker_id_key";

-- AlterTable
ALTER TABLE "hadiah" DROP COLUMN "app_maker_id";

-- AlterTable
ALTER TABLE "kategori_sampah" DROP COLUMN "app_maker_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "app_maker_id";

-- DropTable
DROP TABLE "app_maker";

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
