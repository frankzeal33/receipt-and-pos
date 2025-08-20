-- CreateEnum
CREATE TYPE "public"."StaffRole" AS ENUM ('CO_CEO', 'MANAGER', 'SALES_PERSON');

-- CreateTable
CREATE TABLE "public"."Ceo" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "companyID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ceo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."StaffRole" NOT NULL,
    "ceoId" TEXT NOT NULL,
    "companyID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ceo_email_key" ON "public"."Ceo"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ceo_companyID_key" ON "public"."Ceo"("companyID");

-- CreateIndex
CREATE UNIQUE INDEX "Ceo_id_companyID_key" ON "public"."Ceo"("id", "companyID");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "public"."Staff"("email");

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_ceoId_companyID_fkey" FOREIGN KEY ("ceoId", "companyID") REFERENCES "public"."Ceo"("id", "companyID") ON DELETE CASCADE ON UPDATE CASCADE;
