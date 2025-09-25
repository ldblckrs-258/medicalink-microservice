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
import type { JwtPayloadDto } from '@app/contracts';
import {
  CurrentUser,
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
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Get('/public')
  findAll(@Query() query: any) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.getPublicList',
      query,
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
  create(@Body() createDto: any) {
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
    @Body() updateDto: any,
    @CurrentUser() caller?: JwtPayloadDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.update',
      { id, caller, ...updateDto },
      { timeoutMs: 12000 },
    );
  }

  @RequireWritePermission('doctors')
  @Post(':id/toggle-active')
  toggleActive(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean },
    @CurrentUser() caller?: JwtPayloadDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.toggleActive',
      { id, isActive: body?.isActive, caller },
      { timeoutMs: 8000 },
    );
  }

  @RequireDeletePermission('doctors')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() caller?: JwtPayloadDto) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'doctor-profile.remove',
      { id, caller },
    );
  }
}
