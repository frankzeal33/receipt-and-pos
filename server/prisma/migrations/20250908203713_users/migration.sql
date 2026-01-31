/*
  Warnings:

  - You are about to drop the column `invoiceID` on the `InvoiceItem` table. All the data in the column will be lost.
  - Added the required column `invoiceId` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceID_fkey";

-- AlterTable
ALTER TABLE "public"."InvoiceItem" DROP COLUMN "invoiceID",
ADD COLUMN     "invoiceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
