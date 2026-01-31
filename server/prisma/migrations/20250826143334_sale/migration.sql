/*
  Warnings:

  - Added the required column `recordedByRole` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MainRole" AS ENUM ('CEO', 'CO_CEO', 'MANAGER');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PAID', 'PENDING');

-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "recordedByRole" "public"."MainRole" NOT NULL,
ADD COLUMN     "updatedByRole" "public"."MainRole";

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceName" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" INTEGER NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientAddress" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "invoiceNumber" INTEGER NOT NULL,
    "note" TEXT,
    "companyID" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "addedByRole" "public"."MainRole" NOT NULL,
    "editedBy" TEXT,
    "editedByRole" "public"."MainRole",
    "invoiceItemDescription" TEXT NOT NULL,
    "invoiceItemQuantity" INTEGER NOT NULL,
    "invoiceItemRate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
