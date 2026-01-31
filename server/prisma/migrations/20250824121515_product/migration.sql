/*
  Warnings:

  - Added the required column `currentlyEditedBy` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `editedRole` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "currentlyEditedBy" TEXT NOT NULL,
ADD COLUMN     "editedRole" "public"."AllRole" NOT NULL;
