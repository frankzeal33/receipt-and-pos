-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('UTILITIES', 'SUPPLIES', 'MAINTENANCE', 'MARKETING', 'TAXES', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Expense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "public"."ExpenseCategory" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyID" TEXT NOT NULL,
    "recordedByID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);
