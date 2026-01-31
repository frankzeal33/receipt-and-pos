-- CreateEnum
CREATE TYPE "public"."SaleStatus" AS ENUM ('ACTIVE', 'REVERSE');

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "status" "public"."SaleStatus" NOT NULL DEFAULT 'ACTIVE';
