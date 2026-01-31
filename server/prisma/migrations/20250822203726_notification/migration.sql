-- CreateEnum
CREATE TYPE "public"."AllRole" AS ENUM ('CEO', 'CO_CEO', 'MANAGER', 'SALES_PERSON');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('USER', 'PRODUCT');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userInfo" TEXT NOT NULL,
    "companyID" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User_notification" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "role" "public"."AllRole" NOT NULL,
    "readAll" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_notification_pkey" PRIMARY KEY ("id")
);
