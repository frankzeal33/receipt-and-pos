-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'IN_ACTIVE');

-- AlterTable
ALTER TABLE "public"."Ceo" ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Staff" ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE';
