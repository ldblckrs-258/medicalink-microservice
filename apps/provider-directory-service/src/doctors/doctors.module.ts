import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { DoctorRepository } from './doctor.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [DoctorsController],
  providers: [DoctorsService, DoctorRepository, PrismaService],
  exports: [DoctorsService, DoctorRepository],
})
export class DoctorsModule {}
