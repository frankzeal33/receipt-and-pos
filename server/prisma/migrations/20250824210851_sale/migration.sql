/*
  Warnings:

  - You are about to drop the column `staffID` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `role` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerEmail` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerID` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerIdentifier` to the `SaleItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Sale" DROP COLUMN "staffID",
ADD COLUMN     "role" "public"."AllRole" NOT NULL,
ADD COLUMN     "sellerEmail" TEXT NOT NULL,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "tax" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."SaleItem" ADD COLUMN     "customerID" TEXT NOT NULL,
ADD COLUMN     "customerIdentifier" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(18,2);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email");
