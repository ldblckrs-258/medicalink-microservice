-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "provider";

-- CreateTable
CREATE TABLE "provider"."specialties" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider"."specialty_info_sections" (
    "id" TEXT NOT NULL,
    "specialty_id" VARCHAR(27) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specialty_info_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider"."work_locations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(32),
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "work_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider"."doctors" (
    "id" TEXT NOT NULL,
    "staff_account_id" VARCHAR(27) NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "bio" TEXT,
    "avatar_url" VARCHAR(500),
    "license_no" VARCHAR(64),
    "years_experience" SMALLINT,
    "rating_avg" REAL NOT NULL DEFAULT 0.0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider"."doctor_specialties" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "specialty_id" VARCHAR(27) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider"."doctor_work_locations" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "location_id" VARCHAR(27) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_work_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider"."schedules" (
    "id" TEXT NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "location_id" VARCHAR(27) NOT NULL,
    "service_date" DATE NOT NULL,
    "time_start" TIME(6) NOT NULL,
    "time_end" TIME(6) NOT NULL,
    "capacity" SMALLINT NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "provider"."specialties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_slug_key" ON "provider"."specialties"("slug");

-- CreateIndex
CREATE INDEX "idx_specialty_info_sections_specialty" ON "provider"."specialty_info_sections"("specialty_id");

-- CreateIndex
CREATE INDEX "idx_work_locations_name" ON "provider"."work_locations"("name");

-- CreateIndex
CREATE INDEX "idx_doctors_staff_account" ON "provider"."doctors"("staff_account_id");

-- CreateIndex
CREATE INDEX "idx_doctors_display_name" ON "provider"."doctors"("display_name");

-- CreateIndex
CREATE INDEX "idx_doctor_specialties_specialty" ON "provider"."doctor_specialties"("specialty_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialties_doctor_id_specialty_id_key" ON "provider"."doctor_specialties"("doctor_id", "specialty_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_work_locations_doctor_id_location_id_key" ON "provider"."doctor_work_locations"("doctor_id", "location_id");

-- CreateIndex
CREATE INDEX "idx_schedules_service_date" ON "provider"."schedules"("service_date");

-- CreateIndex
CREATE INDEX "idx_schedules_doctor_date" ON "provider"."schedules"("doctor_id", "service_date");

-- CreateIndex
CREATE INDEX "idx_schedules_location_date" ON "provider"."schedules"("location_id", "service_date");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_doctor_id_location_id_service_date_time_start_tim_key" ON "provider"."schedules"("doctor_id", "location_id", "service_date", "time_start", "time_end");
