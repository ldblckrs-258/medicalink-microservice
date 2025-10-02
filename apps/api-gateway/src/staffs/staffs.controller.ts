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
  RequireUserManagement,
  CurrentUser,
  PaginatedResponse,
} from '@app/contracts';
import type { JwtPayloadDto, PostResponseDto } from '@app/contracts';
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
  ): Promise<PaginatedResponse<IStaffAccount>> {
    return this.microserviceService.sendWithTimeout<
      PaginatedResponse<IStaffAccount>
    >(this.accountsClient, 'staffs.findAll', query, { timeoutMs: 15000 });
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
  ): Promise<IStaffAccount> {
    const staff = await this.microserviceService.sendWithTimeout<IStaffAccount>(
      this.accountsClient,
      'staffs.findOne',
      id,
    );

    return staff;
  }

  @RequireUserManagement()
  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
      this.accountsClient,
      'staffs.create',
      createAccountDto,
      { timeoutMs: 12000 },
    );
  }

  @RequireWritePermission('staff')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
      this.accountsClient,
      'staffs.update',
      {
        id,
        data: updateStaffDto,
      },
      { timeoutMs: 12000 },
    );
  }

  @RequireDeletePermission('staff')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<PostResponseDto> {
    return this.microserviceService.sendWithTimeout<PostResponseDto>(
      this.accountsClient,
      'staffs.remove',
      id,
      { timeoutMs: 12000 },
    );
  }
}
