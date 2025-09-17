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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffAccountDto,
  StaffPaginatedResponseDto,
  StaffStatsDto,
  RequireReadPermission,
  RequireWritePermission,
  RequireDeletePermission,
  RequireUserManagement,
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

  @RequireReadPermission('staff')
  @Get()
  async findAll(
    @Query() query: StaffQueryDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffPaginatedResponseDto> {
    // TODO: Implement permission-based access control
    // Temporarily disabled during JWT payload migration
    // if (user.role === 'ADMIN' && (!query.role || query.role !== 'DOCTOR')) {
    //   query.role = 'DOCTOR';
    // }

    return this.microserviceService.sendWithTimeout<StaffPaginatedResponseDto>(
      this.accountsClient,
      'staffs.findAll',
      query,
      { timeoutMs: 15000 },
    );
  }

  @RequireReadPermission('staff')
  @Get('stats')
  async getStats(): Promise<StaffStatsDto> {
    return this.microserviceService.sendWithTimeout<StaffStatsDto>(
      this.accountsClient,
      'staffs.stats',
      {},
    );
  }

  @RequireReadPermission('staff')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    const staff =
      await this.microserviceService.sendWithTimeout<StaffAccountDto>(
        this.accountsClient,
        'staffs.findOne',
        id,
      );

    // TODO: Implement permission-based access control
    // Temporarily disabled during JWT payload migration
    // if (user.role === 'ADMIN' && staff.role !== 'DOCTOR') {
    //   throw new BadRequestException('Access denied');
    // }

    return staff;
  }

  @RequireUserManagement()
  @Post()
  async create(
    @Body() createStaffDto: CreateStaffDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    // TODO: Implement permission-based access control
    // Temporarily disabled during JWT payload migration
    // if (user.role === 'ADMIN' && createStaffDto.role !== 'DOCTOR') {
    //   throw new BadRequestException(
    //     'Admin can only create staff with DOCTOR role',
    //   );
    // }

    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'staffs.create',
      createStaffDto,
      { timeoutMs: 12000 },
    );
  }

  @RequireWritePermission('staff')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    // First check if the staff member exists and get their current role
    const _existingStaff =
      await this.microserviceService.sendWithTimeout<StaffAccountDto>(
        this.accountsClient,
        'staffs.findOne',
        id,
      );

    // TODO: Implement permission-based access control
    // Temporarily disabled during JWT payload migration
    // if (user.role === 'ADMIN' && existingStaff.role !== 'DOCTOR') {
    //   throw new BadRequestException('Access denied');
    // }

    // if (user.role === 'ADMIN' && updateStaffDto.role) {
    //   throw new BadRequestException('Admin cannot update staff role');
    // }

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

  @RequireDeletePermission('staff-accounts')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'staffs.remove',
      id,
      { timeoutMs: 12000 },
    );
  }
}
