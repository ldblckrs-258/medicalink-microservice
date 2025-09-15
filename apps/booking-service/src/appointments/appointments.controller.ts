import { Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointment() {
    return this.appointmentsService.createAppointment();
  }

  @Get()
  async getAppointments() {
    return this.appointmentsService.getAppointments();
  }

  @Get(':id')
  async getAppointmentById(@Param('id') id: string) {
    return this.appointmentsService.getAppointmentById(id);
  }

  @Put(':id')
  async updateAppointment(@Param('id') _id: string) {
    return this.appointmentsService.updateAppointment();
  }

  @Delete(':id')
  async cancelAppointment(@Param('id') _id: string) {
    return this.appointmentsService.cancelAppointment();
  }

  @Get('schedule-holds')
  async getScheduleHolds() {
    return this.appointmentsService.getScheduleHolds();
  }

  @Post('schedule-holds')
  async createScheduleHold() {
    return this.appointmentsService.createScheduleHold();
  }
}
