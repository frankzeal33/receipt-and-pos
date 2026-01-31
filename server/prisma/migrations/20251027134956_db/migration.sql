/*
  Warnings:

  - Added the required column `address` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "businessName" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
