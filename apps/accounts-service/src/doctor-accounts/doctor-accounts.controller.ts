import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorAccountsService } from './doctor-accounts.service';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffAccountDto,
  StaffPaginatedResponseDto,
  StaffStatsDto,
} from '@app/contracts';

@Controller()
export class DoctorAccountsController {
  constructor(private readonly doctorAccountsService: DoctorAccountsService) {}

  @MessagePattern('doctor-accounts.findAll')
  async findAll(
    @Payload() query: StaffQueryDto,
  ): Promise<StaffPaginatedResponseDto> {
    return await this.doctorAccountsService.findAll(query);
  }

  @MessagePattern('doctor-accounts.findOne')
  async findOne(@Payload() id: string): Promise<StaffAccountDto> {
    return await this.doctorAccountsService.findOne(id);
  }

  @MessagePattern('doctor-accounts.create')
  async create(
    @Payload() createDoctorDto: CreateStaffDto,
  ): Promise<StaffAccountDto> {
    return await this.doctorAccountsService.create(createDoctorDto);
  }

  @MessagePattern('doctor-accounts.update')
  async update(
    @Payload() payload: { id: string; data: UpdateStaffDto },
  ): Promise<StaffAccountDto> {
    return await this.doctorAccountsService.update(payload.id, payload.data);
  }

  @MessagePattern('doctor-accounts.remove')
  async remove(@Payload() id: string): Promise<StaffAccountDto> {
    return await this.doctorAccountsService.remove(id);
  }

  @MessagePattern('doctor-accounts.stats')
  async getStats(): Promise<StaffStatsDto> {
    return await this.doctorAccountsService.getStats();
  }

  @MessagePattern('doctor-accounts.assignPermissions')
  async assignPermissions(
    @Payload() payload: { userId: string; role?: string },
  ): Promise<{ success: boolean; message: string }> {
    return await this.doctorAccountsService.assignPermissionsToUser(
      payload.userId,
      payload.role,
    );
  }
}
