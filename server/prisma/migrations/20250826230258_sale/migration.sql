/*
  Warnings:

  - You are about to drop the column `extraChange` on the `Invoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "extraChange",
ADD COLUMN     "extraCharge" DECIMAL(18,2);
