import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  DoctorProfileQueryDto,
  ToggleDoctorActiveBodyDto,
  Public,
  RequireDeletePermission,
  RequireReadPermission,
  RequireWritePermission,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('doctors/profile')
export class DoctorProfileController {
  constructor(
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerDirectoryClient: ClientProxy,
    @Inject('ORCHESTRATOR_SERVICE')
    private readonly orchestratorClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Get('/public')
  findAll(@Query() query: DoctorProfileQueryDto) {
    // Use orchestrator for composite data (account + profile)
    return this.microserviceService.sendWithTimeout(
      this.orchestratorClient,
      'orchestrator.doctor.searchComposite',
      {
        ...query,
        isActive: true, // Always filter by active doctors for public endpoint
      },
      { timeoutMs: 15000 },
    );
  }

  @RequireReadPermission('doctors')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.findOne',
      id,
    );
  }

  @RequireWritePermission('doctors')
  @Post()
  create(@Body() createDto: CreateDoctorProfileDto) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.create',
      createDto,
      { timeoutMs: 12000 },
    );
  }

  @RequireWritePermission('doctors')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: Omit<UpdateDoctorProfileDto, 'id'>,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.update',
      { id, ...updateDto },
      { timeoutMs: 12000 },
    );
  }

  @RequireWritePermission('doctors')
  @Post(':id/toggle-active')
  toggleActive(
    @Param('id') id: string,
    @Body() body: ToggleDoctorActiveBodyDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.toggleActive',
      { id, isActive: body?.isActive },
      { timeoutMs: 8000 },
    );
  }

  @RequireDeletePermission('doctors')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.remove',
      { id },
    );
  }
}
