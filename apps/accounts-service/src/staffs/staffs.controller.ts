import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StaffsService } from './staffs.service';
import {
  CreateAccountDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffStatsDto,
  PaginatedResponse,
} from '@app/contracts';
import { StaffAccount } from '../../prisma/generated/client';

@Controller()
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @MessagePattern('staffs.findAll')
  async findAll(
    @Payload() query: StaffQueryDto,
  ): Promise<PaginatedResponse<StaffAccount>> {
    return this.staffsService.findAll(query);
  }

  @MessagePattern('staffs.findOne')
  async findOne(@Payload() id: string): Promise<StaffAccount> {
    return this.staffsService.findOne(id);
  }

  @MessagePattern('staffs.create')
  async create(
    @Payload() createAccountDto: CreateAccountDto,
  ): Promise<StaffAccount> {
    return this.staffsService.create(createAccountDto);
  }

  @MessagePattern('staffs.update')
  async update(
    @Payload() payload: { id: string; data: UpdateStaffDto },
  ): Promise<StaffAccount> {
    return this.staffsService.update(payload.id, payload.data);
  }

  @MessagePattern('staffs.remove')
  async remove(@Payload() id: string): Promise<StaffAccount> {
    return this.staffsService.remove(id);
  }

  @MessagePattern('staffs.stats')
  async getStats(): Promise<StaffStatsDto> {
    return this.staffsService.getStats();
  }

  @MessagePattern('staffs.assignPermissions')
  async assignPermissions(
    @Payload() payload: { userId: string; role?: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.staffsService.assignPermissionsToUser(
      payload.userId,
      payload.role,
    );
  }
}
