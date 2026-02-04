/*
  Warnings:

  - Added the required column `currency` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."currency" AS ENUM ('NGN', 'USD');

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "currency" "public"."currency" NOT NULL;
