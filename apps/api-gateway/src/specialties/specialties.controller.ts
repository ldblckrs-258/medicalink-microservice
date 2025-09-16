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
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyDto,
  Roles,
  Public,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('specialties')
export class SpecialtiesController {
  constructor(
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerDirectoryClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Public - get all active specialties
  @Public()
  @Get('public')
  findAllPublic() {
    const publicQuery = {
      isActive: true,
      page: 1,
      limit: 100, // Get all active specialties
      sortBy: 'name',
      sortOrder: 'ASC' as const,
      includeMetadata: false, // Exclude isActive, createdAt, updatedAt
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'specialties.findAll',
      publicQuery,
    );
  }

  // Admin only - get all specialties with flexible filtering
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll(@Query() query: SpecialtyQueryDto) {
    // Default to include metadata for admin endpoints
    const adminQuery = {
      ...query,
      includeMetadata: query.includeMetadata ?? true,
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'specialties.findAll',
      adminQuery,
    );
  }

  // Public - get specialties stats
  @Public()
  @Get('stats')
  getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    return this.microserviceService.sendWithTimeout<{
      total: number;
      recentlyCreated: number;
    }>(this.providerDirectoryClient, 'specialties.stats', {});
  }

  // Public - get specialty by id
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<SpecialtyDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyDto>(
      this.providerDirectoryClient,
      'specialties.findOne',
      id,
    );
  }

  // Admin only - create new specialty
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(
    @Body() createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyDto>(
      this.providerDirectoryClient,
      'specialties.create',
      createSpecialtyDto,
    );
  }

  // Admin only - update specialty
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<SpecialtyDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyDto>(
      this.providerDirectoryClient,
      'specialties.update',
      {
        id,
        data: updateSpecialtyDto,
      },
    );
  }

  // Admin only - delete specialty
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<SpecialtyDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyDto>(
      this.providerDirectoryClient,
      'specialties.remove',
      id,
    );
  }
}
