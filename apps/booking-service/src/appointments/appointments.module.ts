import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
// import { AppointmentsRepository } from '.appointments.repository';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
