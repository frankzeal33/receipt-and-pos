/*
  Warnings:

  - You are about to drop the column `clientAddress` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `clientEmail` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `clientPhoneNo` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceItemDescription` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceItemQuantity` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceItemRate` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceItemTotal` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `customerName` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "clientAddress",
DROP COLUMN "clientEmail",
DROP COLUMN "clientName",
DROP COLUMN "clientPhoneNo",
DROP COLUMN "invoiceItemDescription",
DROP COLUMN "invoiceItemQuantity",
DROP COLUMN "invoiceItemRate",
DROP COLUMN "invoiceItemTotal",
ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "discount" DECIMAL(18,2),
ADD COLUMN     "discountName" TEXT;

-- CreateTable
CREATE TABLE "public"."InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceID" TEXT NOT NULL,
    "itemTitle" TEXT NOT NULL,
    "itemQuantity" INTEGER NOT NULL,
    "itemAmount" DECIMAL(18,2) NOT NULL,
    "itemTotal" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceID_fkey" FOREIGN KEY ("invoiceID") REFERENCES "public"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
