import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { SpecialtyRepository } from './specialty.repository';
import { SpecialtyInfoSectionRepository } from './specialty-info-section.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SpecialtiesController],
  providers: [
    SpecialtiesService,
    SpecialtyRepository,
    SpecialtyInfoSectionRepository,
    PrismaService,
  ],
  exports: [
    SpecialtiesService,
    SpecialtyRepository,
    SpecialtyInfoSectionRepository,
  ],
})
export class SpecialtiesModule {}
