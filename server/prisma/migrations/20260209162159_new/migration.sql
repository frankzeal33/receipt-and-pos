-- AlterTable
ALTER TABLE "public"."Branch" ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE';
