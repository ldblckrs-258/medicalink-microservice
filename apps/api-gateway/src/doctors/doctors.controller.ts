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
import { IStaffAccount } from '@app/contracts/interfaces';
import {
  CreateAccountDto,
  UpdateStaffDto,
  StaffQueryDto,
  StaffStatsDto,
  RequireReadPermission,
  RequireWritePermission,
  RequireDeletePermission,
  CurrentUser,
  PaginatedResponse,
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
  ): Promise<PaginatedResponse<IStaffAccount>> {
    return this.microserviceService.sendWithTimeout<
      PaginatedResponse<IStaffAccount>
    >(this.accountsClient, 'doctor-accounts.findAll', query, {
      timeoutMs: 15000,
    });
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
  ): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
      this.accountsClient,
      'doctor-accounts.findOne',
      id,
    );
  }

  @RequireWritePermission('doctors')
  @Post()
  async create(
    @Body() createDoctorDto: CreateAccountDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
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
  ): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
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
  async remove(@Param('id') id: string): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
      this.accountsClient,
      'doctor-accounts.remove',
      id,
      { timeoutMs: 12000 },
    );
  }
}
