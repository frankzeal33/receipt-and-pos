/*
  Warnings:

  - You are about to drop the column `recordedByID` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `recordedByEmail` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Expense" DROP COLUMN "recordedByID",
ADD COLUMN     "recordedByEmail" TEXT NOT NULL,
ADD COLUMN     "updatedByEmail" TEXT;
