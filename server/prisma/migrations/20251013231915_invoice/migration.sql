-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "totalTax" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."InvoiceItem" ADD COLUMN     "tax" DECIMAL(18,2) NOT NULL DEFAULT 0;
