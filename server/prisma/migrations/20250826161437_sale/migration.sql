/*
  Warnings:

  - You are about to drop the column `total` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `invoiceItemTotal` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `dueDate` on the `Invoice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "total",
ADD COLUMN     "clientPhoneNo" TEXT,
ADD COLUMN     "extraChange" DECIMAL(18,2),
ADD COLUMN     "extraChargeName" TEXT,
ADD COLUMN     "invoiceItemTotal" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(18,2) NOT NULL,
DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "clientEmail" DROP NOT NULL,
ALTER COLUMN "clientAddress" DROP NOT NULL,
ALTER COLUMN "invoiceItemRate" SET DATA TYPE DECIMAL(18,2);
