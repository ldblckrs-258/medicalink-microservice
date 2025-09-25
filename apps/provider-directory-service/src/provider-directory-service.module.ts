import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorsModule } from './doctors/doctors.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { WorkLocationsModule } from './work-locations/work-locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SpecialtiesModule,
    WorkLocationsModule,
    DoctorsModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class ProviderDirectoryServiceModule {}
