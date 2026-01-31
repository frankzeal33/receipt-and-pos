/*
  Warnings:

  - You are about to drop the column `userID` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `UserNotification` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "userID",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserNotification" DROP COLUMN "userID",
ADD COLUMN     "userId" TEXT NOT NULL;
