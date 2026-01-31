/*
  Warnings:

  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - Changed the type of `role` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(18,2),
DROP COLUMN "role",
ADD COLUMN     "role" "public"."AllRole" NOT NULL;
