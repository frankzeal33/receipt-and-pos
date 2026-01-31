/*
  Warnings:

  - The values [REVERSE] on the enum `SaleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SaleStatus_new" AS ENUM ('ACTIVE', 'CORRECTED', 'VOID');
ALTER TABLE "public"."Sale" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Sale" ALTER COLUMN "status" TYPE "public"."SaleStatus_new" USING ("status"::text::"public"."SaleStatus_new");
ALTER TYPE "public"."SaleStatus" RENAME TO "SaleStatus_old";
ALTER TYPE "public"."SaleStatus_new" RENAME TO "SaleStatus";
DROP TYPE "public"."SaleStatus_old";
ALTER TABLE "public"."Sale" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "correctedBy" TEXT;
