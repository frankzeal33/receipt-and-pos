/*
  Warnings:

  - Added the required column `companyID` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "companyID" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
