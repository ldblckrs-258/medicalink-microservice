-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "accounts";

-- CreateEnum
CREATE TYPE "accounts"."StaffRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DOCTOR');

-- CreateTable
CREATE TABLE "accounts"."staff_accounts" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "accounts"."StaffRole" NOT NULL DEFAULT 'ADMIN',
    "phone" VARCHAR(32),
    "is_male" BOOLEAN,
    "date_of_birth" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "staff_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts"."patients" (
    "id" TEXT NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(32),
    "is_male" BOOLEAN,
    "date_of_birth" DATE,
    "national_id" VARCHAR(50),
    "insurance_no" VARCHAR(50),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "province" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_email_key" ON "accounts"."staff_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "accounts"."patients"("email");

-- CreateIndex
CREATE INDEX "idx_patients_full_name" ON "accounts"."patients"("full_name");

-- CreateIndex
CREATE INDEX "idx_patients_phone" ON "accounts"."patients"("phone");
