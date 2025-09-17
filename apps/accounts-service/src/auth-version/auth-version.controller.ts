import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthVersionService } from './auth-version.service';

@Controller()
export class AuthVersionController {
  constructor(private readonly authVersionService: AuthVersionService) {}

  @MessagePattern('auth-version.getUserVersion')
  async getUserAuthVersion(@Payload() payload: { userId: string }) {
    return this.authVersionService.getUserAuthVersion(payload.userId);
  }

  @MessagePattern('auth-version.incrementUserVersion')
  async incrementUserAuthVersion(@Payload() payload: { userId: string }) {
    return this.authVersionService.incrementUserAuthVersion(payload.userId);
  }

  @MessagePattern('auth-version.incrementMultipleUsersVersion')
  async incrementMultipleUsersAuthVersion(
    @Payload() payload: { userIds: string[] },
  ) {
    return this.authVersionService.incrementMultipleUsersAuthVersion(
      payload.userIds,
    );
  }

  @MessagePattern('auth-version.getMultipleUsersVersion')
  async getMultipleUsersAuthVersion(@Payload() payload: { userIds: string[] }) {
    return this.authVersionService.getMultipleUsersAuthVersion(payload.userIds);
  }

  @MessagePattern('auth-version.resetUserVersion')
  async resetUserAuthVersion(@Payload() payload: { userId: string }) {
    return this.authVersionService.resetUserAuthVersion(payload.userId);
  }

  @MessagePattern('auth-version.getStats')
  async getAuthVersionStats() {
    return this.authVersionService.getAuthVersionStats();
  }

  @MessagePattern('auth-version.cleanup')
  async cleanupOldAuthVersions(@Payload() payload: { daysOld?: number } = {}) {
    return this.authVersionService.cleanupOldAuthVersions(
      payload.daysOld || 30,
    );
  }
}
