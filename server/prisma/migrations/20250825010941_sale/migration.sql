/*
  Warnings:

  - You are about to drop the column `subtotal` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `total` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SaleItem" DROP COLUMN "subtotal",
ADD COLUMN     "total" DECIMAL(18,2) NOT NULL;
