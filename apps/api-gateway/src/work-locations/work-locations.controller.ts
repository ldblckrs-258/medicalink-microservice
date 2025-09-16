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
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
  WorkLocationQueryDto,
  WorkLocationDto,
  Roles,
  Public,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('work-locations')
export class WorkLocationsController {
  constructor(
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerDirectoryClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Public - get all active work locations
  @Public()
  @Get('public')
  findAllPublic() {
    // Hard-coded filter: only active work locations, no pagination for public use
    const publicQuery = {
      isActive: true,
      page: 1,
      limit: 100, // Get all active work locations
      sortBy: 'name',
      sortOrder: 'ASC' as const,
      includeMetadata: false, // Exclude isActive, createdAt, updatedAt
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'work-locations.findAll',
      publicQuery,
    );
  }

  // Admin only - get all work locations with flexible filtering
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll(@Query() query: WorkLocationQueryDto) {
    // Default to include metadata for admin endpoints
    const adminQuery = {
      ...query,
      includeMetadata: query.includeMetadata ?? true,
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'work-locations.findAll',
      adminQuery,
    );
  }

  // Public - get work locations stats
  @Public()
  @Get('stats')
  getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.microserviceService.sendWithTimeout<{
      total: number;
      recentlyCreated: number;
    }>(this.providerDirectoryClient, 'work-locations.stats', {});
  }

  // Public - get work location by id
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.findOne',
      id,
    );
  }

  // Admin only - create new work location

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(
    @Body() createWorkLocationDto: CreateWorkLocationDto,
  ): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.create',
      createWorkLocationDto,
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkLocationDto: UpdateWorkLocationDto,
  ): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.update',
      { id, data: updateWorkLocationDto },
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<WorkLocationDto> {
    return this.microserviceService.sendWithTimeout<WorkLocationDto>(
      this.providerDirectoryClient,
      'work-locations.remove',
      id,
    );
  }
}
