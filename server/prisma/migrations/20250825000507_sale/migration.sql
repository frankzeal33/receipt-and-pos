/*
  Warnings:

  - You are about to drop the column `customerID` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `customerIdentifier` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `customerName` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "customerID" TEXT,
ADD COLUMN     "customerIdentifier" TEXT,
ADD COLUMN     "customerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SaleItem" DROP COLUMN "customerID",
DROP COLUMN "customerIdentifier",
DROP COLUMN "customerName";
