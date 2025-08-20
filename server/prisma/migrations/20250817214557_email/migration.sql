/*
  Warnings:

  - You are about to drop the column `email_Verified` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Users" DROP COLUMN "email_Verified",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
