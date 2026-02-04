/*
  Warnings:

  - Added the required column `companyId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "companyId" TEXT NOT NULL;
