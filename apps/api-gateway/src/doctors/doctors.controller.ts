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
  CurrentUser,
} from '@app/contracts';
import type { JwtPayloadDto } from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('doctors')
export class DoctorsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @RequireReadPermission('doctors')
  @Get()
  async findAll(
    @Query() query: StaffQueryDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffPaginatedResponseDto> {
    return this.microserviceService.sendWithTimeout<StaffPaginatedResponseDto>(
      this.accountsClient,
      'doctor-accounts.findAll',
      query,
      { timeoutMs: 15000 },
    );
  }

  @RequireReadPermission('doctors')
  @Get('stats')
  async getStats(): Promise<StaffStatsDto> {
    return this.microserviceService.sendWithTimeout<StaffStatsDto>(
      this.accountsClient,
      'doctor-accounts.stats',
      {},
    );
  }

  @RequireReadPermission('doctors')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'doctor-accounts.findOne',
      id,
    );
  }

  @RequireWritePermission('doctors')
  @Post()
  async create(
    @Body() createDoctorDto: CreateStaffDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'doctor-accounts.create',
      createDoctorDto,
      { timeoutMs: 12000 },
    );
  }

  @RequireWritePermission('doctors')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateStaffDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'doctor-accounts.update',
      {
        id,
        data: updateDoctorDto,
      },
      { timeoutMs: 12000 },
    );
  }

  @RequireDeletePermission('doctors')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'doctor-accounts.remove',
      id,
      { timeoutMs: 12000 },
    );
  }
}
