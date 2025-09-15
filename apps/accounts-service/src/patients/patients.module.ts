import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientRepository } from './patient.repository';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PatientRepository],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule {}
