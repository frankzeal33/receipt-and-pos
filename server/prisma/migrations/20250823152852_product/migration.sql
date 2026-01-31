/*
  Warnings:

  - Added the required column `addedBy` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyID` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "addedBy" TEXT NOT NULL,
ADD COLUMN     "companyID" TEXT NOT NULL,
ADD COLUMN     "role" "public"."StaffRole" NOT NULL;
