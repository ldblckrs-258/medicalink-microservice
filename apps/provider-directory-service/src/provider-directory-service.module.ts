import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorsService } from './doctors/doctors.service';
import { DoctorsController } from './doctors/doctors.controller';
import { SpecialtiesModule } from './specialties/specialties.module';
import { WorkLocationsModule } from './work-locations/work-locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SpecialtiesModule,
    WorkLocationsModule,
  ],
  controllers: [DoctorsController],
  providers: [PrismaService, DoctorsService],
})
export class ProviderDirectoryServiceModule {}
