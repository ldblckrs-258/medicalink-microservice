import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DoctorsService } from './doctors/doctors.service';
import { DoctorsController } from './doctors/doctors.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [DoctorsController],
  providers: [PrismaService, DoctorsService],
})
export class ProviderDirectoryServiceModule {}
