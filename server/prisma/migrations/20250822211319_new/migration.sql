/*
  Warnings:

  - You are about to drop the column `userInfo` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `User_notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "userInfo";

-- DropTable
DROP TABLE "public"."User_notification";

-- CreateTable
CREATE TABLE "public"."UserNotification" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "role" "public"."AllRole" NOT NULL,
    "companyID" TEXT NOT NULL,
    "readAll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);
