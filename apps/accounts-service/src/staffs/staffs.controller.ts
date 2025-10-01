import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StaffsService } from './staffs.service';
import {
  CreateAccountDto,
  UpdateStaffDto,
  StaffQueryDto,
} from '@app/contracts';

@Controller()
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @MessagePattern('staffs.findAll')
  async findAll(@Payload() query: StaffQueryDto) {
    return this.staffsService.findAll(query);
  }

  @MessagePattern('staffs.findOne')
  async findOne(@Payload() id: string) {
    return this.staffsService.findOne(id);
  }

  @MessagePattern('staffs.create')
  async create(@Payload() createAccountDto: CreateAccountDto) {
    return this.staffsService.create(createAccountDto);
  }

  @MessagePattern('staffs.update')
  async update(@Payload() payload: { id: string; data: UpdateStaffDto }) {
    return this.staffsService.update(payload.id, payload.data);
  }

  @MessagePattern('staffs.remove')
  async remove(@Payload() id: string) {
    await this.staffsService.remove(id);
    return { success: true, message: 'Staff member removed successfully' };
  }

  @MessagePattern('staffs.stats')
  async getStats() {
    return this.staffsService.getStats();
  }

  @MessagePattern('staffs.assignPermissions')
  async assignPermissions(
    @Payload() payload: { userId: string; role?: string },
  ) {
    return this.staffsService.assignPermissionsToUser(
      payload.userId,
      payload.role,
    );
  }
}
