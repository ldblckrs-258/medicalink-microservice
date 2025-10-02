-- DropForeignKey
ALTER TABLE "provider"."doctor_specialties" DROP CONSTRAINT "doctor_specialties_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "provider"."doctor_specialties" DROP CONSTRAINT "doctor_specialties_specialty_id_fkey";

-- DropForeignKey
ALTER TABLE "provider"."doctor_work_locations" DROP CONSTRAINT "doctor_work_locations_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "provider"."doctor_work_locations" DROP CONSTRAINT "doctor_work_locations_location_id_fkey";

-- DropForeignKey
ALTER TABLE "provider"."specialty_info_sections" DROP CONSTRAINT "specialty_info_sections_specialty_id_fkey";

-- AddForeignKey
ALTER TABLE "provider"."specialty_info_sections" ADD CONSTRAINT "specialty_info_sections_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "provider"."specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "provider"."doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "provider"."specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_work_locations" ADD CONSTRAINT "doctor_work_locations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "provider"."doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_work_locations" ADD CONSTRAINT "doctor_work_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "provider"."work_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
