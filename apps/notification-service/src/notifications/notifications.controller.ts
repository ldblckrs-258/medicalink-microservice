import { Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async sendNotification() {
    return this.notificationsService.sendNotification();
  }

  @Get('templates')
  async getNotificationTemplates() {
    return this.notificationsService.getNotificationTemplates();
  }

  @Post('templates')
  async createNotificationTemplate() {
    return this.notificationsService.createNotificationTemplate();
  }

  @Put('templates/:id')
  async updateNotificationTemplate(@Param('id') _id: string) {
    return this.notificationsService.updateNotificationTemplate();
  }

  @Delete('templates/:id')
  async deleteNotificationTemplate(@Param('id') _id: string) {
    return this.notificationsService.deleteNotificationTemplate();
  }

  @Get('deliveries')
  async getNotificationDeliveries() {
    return this.notificationsService.getNotificationDeliveries();
  }
}
