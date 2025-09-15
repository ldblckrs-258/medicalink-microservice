import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffAccountDto,
  StaffPaginatedResponseDto,
  StaffStatsDto,
  Roles,
  CurrentUser,
} from '@app/contracts';
import type { JwtPayloadDto } from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('staffs')
export class StaffsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  async findAll(
    @Query() query: StaffQueryDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffPaginatedResponseDto> {
    // ADMIN can only get DOCTOR role staff
    if (user.role === 'ADMIN' && (!query.role || query.role !== 'DOCTOR')) {
      query.role = 'DOCTOR';
    }

    return this.microserviceService.sendWithTimeout<StaffPaginatedResponseDto>(
      this.accountsClient,
      'staffs.findAll',
      query,
      { timeoutMs: 15000 },
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('stats')
  async getStats(): Promise<StaffStatsDto> {
    return this.microserviceService.sendWithTimeout<StaffStatsDto>(
      this.accountsClient,
      'staffs.stats',
      {},
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    const staff =
      await this.microserviceService.sendWithTimeout<StaffAccountDto>(
        this.accountsClient,
        'staffs.findOne',
        id,
      );

    // ADMIN can only get DOCTOR role staff
    if (user.role === 'ADMIN' && staff.role !== 'DOCTOR') {
      throw new BadRequestException('Access denied');
    }

    return staff;
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  async create(
    @Body() createStaffDto: CreateStaffDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    // ADMIN can only create DOCTOR role staff
    if (user.role === 'ADMIN' && createStaffDto.role !== 'DOCTOR') {
      throw new BadRequestException(
        'Admin can only create staff with DOCTOR role',
      );
    }

    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'staffs.create',
      createStaffDto,
      { timeoutMs: 12000 },
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    // First check if the staff member exists and get their current role
    const existingStaff =
      await this.microserviceService.sendWithTimeout<StaffAccountDto>(
        this.accountsClient,
        'staffs.findOne',
        id,
      );

    // ADMIN can only update DOCTOR role staff
    if (user.role === 'ADMIN' && existingStaff.role !== 'DOCTOR') {
      throw new BadRequestException('Access denied');
    }

    // ADMIN cannot update role field
    if (user.role === 'ADMIN' && updateStaffDto.role) {
      throw new BadRequestException('Admin cannot update staff role');
    }

    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'staffs.update',
      {
        id,
        data: updateStaffDto,
      },
      { timeoutMs: 12000 },
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    // First check if the staff member exists and get their current role
    const existingStaff =
      await this.microserviceService.sendWithTimeout<StaffAccountDto>(
        this.accountsClient,
        'staffs.findOne',
        id,
      );

    // ADMIN can only delete DOCTOR role staff
    if (user.role === 'ADMIN' && existingStaff.role !== 'DOCTOR') {
      throw new BadRequestException('Access denied');
    }

    // PREVENT delete SUPER_ADMIN
    if (existingStaff.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot delete SUPER_ADMIN');
    }

    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'staffs.remove',
      id,
    );
  }
}
