/*
  Warnings:

  - You are about to drop the column `totalTax` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "totalTax",
ADD COLUMN     "totalTaxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0;
