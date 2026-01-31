/*
  Warnings:

  - You are about to drop the column `companyID` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `companyID` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `companyID` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `companyID` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `companyID` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `companyID` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `companyID` on the `UserNotification` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `UserNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Expense" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Sale" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserNotification" DROP COLUMN "companyID",
ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "companyId" TEXT NOT NULL;
