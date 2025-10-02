-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "booking";

-- CreateEnum
CREATE TYPE "booking"."AppointmentStatus" AS ENUM ('BOOKED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED_BY_PATIENT', 'CANCELLED_BY_STAFF', 'NO_SHOW', 'COMPLETED');

-- CreateTable
CREATE TABLE "booking"."patients" (
    "id" VARCHAR(27) NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(32),
    "is_male" BOOLEAN,
    "date_of_birth" DATE,
    "address_line" VARCHAR(255),
    "district" VARCHAR(100),
    "province" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking"."appointments" (
    "id" TEXT NOT NULL,
    "patient_id" VARCHAR(27) NOT NULL,
    "doctor_id" VARCHAR(27) NOT NULL,
    "schedule_id" VARCHAR(27) NOT NULL,
    "location_id" VARCHAR(27) NOT NULL,
    "service_date" DATE NOT NULL,
    "time_start" TIME(6) NOT NULL,
    "time_end" TIME(6) NOT NULL,
    "status" "booking"."AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "reason" VARCHAR(255),
    "notes" TEXT,
    "price_amount" DECIMAL(12,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'VND',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "cancelled_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking"."appointment_events" (
    "id" TEXT NOT NULL,
    "appointment_id" VARCHAR(27) NOT NULL,
    "event_type" VARCHAR(40) NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "appointment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking"."schedule_holds" (
    "id" TEXT NOT NULL,
    "schedule_id" VARCHAR(27) NOT NULL,
    "patient_id" VARCHAR(27) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'HELD',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_holds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "booking"."patients"("email");

-- CreateIndex
CREATE INDEX "idx_patients_full_name" ON "booking"."patients"("full_name");

-- CreateIndex
CREATE INDEX "idx_patients_phone" ON "booking"."patients"("phone");

-- CreateIndex
CREATE INDEX "idx_appointments_patient_date" ON "booking"."appointments"("patient_id", "service_date");

-- CreateIndex
CREATE INDEX "idx_appointments_doctor_date" ON "booking"."appointments"("doctor_id", "service_date");

-- CreateIndex
CREATE INDEX "idx_appointments_status_date" ON "booking"."appointments"("status", "service_date");

-- CreateIndex
CREATE INDEX "idx_appointments_date_time" ON "booking"."appointments"("service_date", "time_start");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_schedule_id_patient_id_key" ON "booking"."appointments"("schedule_id", "patient_id");

-- CreateIndex
CREATE INDEX "idx_appointment_events_appt_time" ON "booking"."appointment_events"("appointment_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_schedule_holds_schedule" ON "booking"."schedule_holds"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_schedule_holds_patient" ON "booking"."schedule_holds"("patient_id");

-- CreateIndex
CREATE INDEX "idx_schedule_holds_expires" ON "booking"."schedule_holds"("expires_at");

-- AddForeignKey
ALTER TABLE "booking"."appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "booking"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking"."appointment_events" ADD CONSTRAINT "appointment_events_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "booking"."appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking"."schedule_holds" ADD CONSTRAINT "schedule_holds_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "booking"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
