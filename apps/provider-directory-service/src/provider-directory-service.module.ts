import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorsModule } from './doctors/doctors.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { WorkLocationsModule } from './work-locations/work-locations.module';
import { HealthController } from './health/health.controller';
import { RabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
    SpecialtiesModule,
    WorkLocationsModule,
    DoctorsModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class ProviderDirectoryServiceModule {}
