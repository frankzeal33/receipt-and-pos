/*
  Warnings:

  - Changed the type of `currency` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."payingCurrency" AS ENUM ('NGN', 'USD');

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "currency",
ADD COLUMN     "currency" "public"."payingCurrency" NOT NULL;

-- DropEnum
DROP TYPE "public"."currency";
