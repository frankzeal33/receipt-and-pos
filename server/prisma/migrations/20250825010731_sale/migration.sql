/*
  Warnings:

  - A unique constraint covering the columns `[receiptNo]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiptNo` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "receiptNo" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_receiptNo_key" ON "public"."Sale"("receiptNo");
