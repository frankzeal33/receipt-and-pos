-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'uncategorized',
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'uncategorized';
