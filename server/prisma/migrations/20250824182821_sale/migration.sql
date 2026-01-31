/*
  Warnings:

  - Made the column `role` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userID` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Notification" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "userID" SET NOT NULL;
