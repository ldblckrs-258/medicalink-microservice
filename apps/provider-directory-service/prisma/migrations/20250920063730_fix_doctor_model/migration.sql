/*
  Warnings:

  - You are about to drop the column `bio` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `license_no` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `rating_avg` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `review_count` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `years_experience` on the `doctors` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[staff_account_id]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "provider"."idx_doctors_display_name";

-- DropIndex
DROP INDEX "provider"."idx_doctors_staff_account";

-- AlterTable
ALTER TABLE "provider"."doctors" DROP COLUMN "bio",
DROP COLUMN "display_name",
DROP COLUMN "is_active",
DROP COLUMN "license_no",
DROP COLUMN "rating_avg",
DROP COLUMN "review_count",
DROP COLUMN "years_experience",
ADD COLUMN     "awards" TEXT[],
ADD COLUMN     "degree" VARCHAR(100),
ADD COLUMN     "experience" TEXT[],
ADD COLUMN     "introduction" TEXT,
ADD COLUMN     "memberships" TEXT[],
ADD COLUMN     "portrait" VARCHAR,
ADD COLUMN     "position" TEXT[],
ADD COLUMN     "research" TEXT,
ADD COLUMN     "training_process" TEXT[],
ALTER COLUMN "staff_account_id" SET DATA TYPE TEXT,
ALTER COLUMN "avatar_url" SET DATA TYPE VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "doctors_staff_account_id_key" ON "provider"."doctors"("staff_account_id");

-- AddForeignKey
ALTER TABLE "provider"."specialty_info_sections" ADD CONSTRAINT "specialty_info_sections_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "provider"."specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "provider"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "provider"."specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_work_locations" ADD CONSTRAINT "doctor_work_locations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "provider"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."doctor_work_locations" ADD CONSTRAINT "doctor_work_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "provider"."work_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."schedules" ADD CONSTRAINT "schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "provider"."doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider"."schedules" ADD CONSTRAINT "schedules_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "provider"."work_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
