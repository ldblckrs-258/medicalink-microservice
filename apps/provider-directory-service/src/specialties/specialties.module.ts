import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtyRepository } from './specialty.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, SpecialtyRepository, PrismaService],
  exports: [SpecialtiesService, SpecialtyRepository],
})
export class SpecialtiesModule {}
