-- CreateEnum
CREATE TYPE "public"."productStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK');

-- CreateEnum
CREATE TYPE "public"."receiptStatus" AS ENUM ('PREORDER', 'BACKORDER', 'DAMAGED', 'RESERVED');

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "public"."productStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
