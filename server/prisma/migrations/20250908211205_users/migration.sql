/*
  Warnings:

  - You are about to drop the column `customerID` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `productID` on the `SaleItem` table. All the data in the column will be lost.
  - You are about to drop the column `saleID` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `productId` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleId` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."SaleItem" DROP CONSTRAINT "SaleItem_productID_fkey";

-- DropForeignKey
ALTER TABLE "public"."SaleItem" DROP CONSTRAINT "SaleItem_saleID_fkey";

-- AlterTable
ALTER TABLE "public"."Sale" DROP COLUMN "customerID",
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "public"."SaleItem" DROP COLUMN "productID",
DROP COLUMN "saleID",
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "saleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
