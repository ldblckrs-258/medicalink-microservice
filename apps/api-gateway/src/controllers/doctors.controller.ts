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
  RequireUpdatePermission,
  RequireDeletePermission,
  CurrentUser,
} from '@app/contracts';
import type { JwtPayloadDto } from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('doctors')
export class DoctorsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    @Inject('ORCHESTRATOR_SERVICE')
    private readonly orchestratorClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @RequireReadPermission('doctors')
  @Get()
  async findAll(
    @Query() query: StaffQueryDto,
    @CurrentUser() _user: JwtPayloadDto,
  ): Promise<any> {
    // Use orchestrator to get admin composite list (full metadata)
    const result: any = await this.microserviceService.sendWithTimeout(
      this.orchestratorClient,
      'orchestrator.doctor.listComposite',
      query,
      {
        timeoutMs: 20000,
      },
    );

    return {
      data: result.data,
      meta: result.meta,
    };
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

  /**
   * Search doctors with complete data (account + profile merged)
   * Uses orchestrator for read composition with caching
   */
  @RequireReadPermission('doctors')
  @Get('search/complete')
  async searchDoctorsComplete(
    @Query() query: any,
    @CurrentUser() _user?: JwtPayloadDto,
  ) {
    // Use orchestrator to get composite list with profileId, isActive, and avatarUrl
    return this.microserviceService.sendWithTimeout(
      this.orchestratorClient,
      'orchestrator.doctor.searchComposite',
      query,
      {
        timeoutMs: 20000,
      },
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

  /**
   * Get complete doctor data (account + profile merged)
   * Uses orchestrator for read composition with caching
   */
  @RequireReadPermission('doctors')
  @Get(':id/complete')
  async getDoctorComplete(
    @Param('id') id: string,
    @Query('skipCache') skipCache?: boolean,
    @CurrentUser() _user?: JwtPayloadDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.orchestratorClient,
      'orchestrator.doctor.getComposite',
      { staffAccountId: id, skipCache: skipCache === true },
      { timeoutMs: 15000 },
    );
  }

  /**
   * Create a complete doctor (account + profile)
   * Uses orchestrator for multi-step saga orchestration
   */
  @RequireUpdatePermission('doctors')
  @Post()
  async create(
    @Body() createDoctorDto: CreateAccountDto,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.orchestratorClient,
      'orchestrator.doctor.create',
      {
        ...createDoctorDto,
        userId: user.sub,
        correlationId: `doctor-create-${Date.now()}`,
      },
      { timeoutMs: 30000 }, // Longer timeout for orchestration
    );
  }

  @RequireUpdatePermission('doctors')
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
