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
  Public,
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
  SpecialtyResponseDto,
  SpecialtyWithInfoSectionsResponseDto,
  CreateSpecialtyInfoSectionDto,
  UpdateSpecialtyInfoSectionDto,
  SpecialtyInfoSectionResponseDto,
  RequireReadPermission,
  RequireWritePermission,
  RequireDeletePermission,
  RequirePermission,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';
@Controller('specialties')
export class SpecialtiesController {
  constructor(
    @Inject('PROVIDER_DIRECTORY_SERVICE')
    private readonly providerDirectoryClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Get('public')
  findAllPublic() {
    const publicQuery = {
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'ASC' as const,
    };

    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'specialties.findAllPublic',
      publicQuery,
    );
  }

  @RequireReadPermission('specialties')
  @Get()
  findAll(@Query() query: SpecialtyQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.providerDirectoryClient,
      'specialties.findAllAdmin',
      query,
    );
  }

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

  @Public()
  @Get('public/:slug')
  findBySlug(
    @Param('slug') slug: string,
  ): Promise<SpecialtyWithInfoSectionsResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyWithInfoSectionsResponseDto>(
      this.providerDirectoryClient,
      'specialties.findBySlug',
      slug,
    );
  }

  @RequirePermission('specialties', 'read')
  @Get(':id')
  findOne(@Param('id') id: string): Promise<SpecialtyResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyResponseDto>(
      this.providerDirectoryClient,
      'specialties.findOne',
      id,
    );
  }

  @RequireReadPermission('specialties')
  @Get(':specialtyId/info-sections')
  findInfoSectionsBySpecialtyId(
    @Param('specialtyId') specialtyId: string,
  ): Promise<SpecialtyInfoSectionResponseDto[]> {
    return this.microserviceService.sendWithTimeout<
      SpecialtyInfoSectionResponseDto[]
    >(
      this.providerDirectoryClient,
      'specialties.findInfoSectionsBySpecialtyId',
      specialtyId,
    );
  }

  @RequireWritePermission('specialties')
  @Post('info-sections')
  createInfoSection(
    @Body() createInfoSectionDto: CreateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyInfoSectionResponseDto>(
      this.providerDirectoryClient,
      'specialties.createInfoSection',
      createInfoSectionDto,
    );
  }

  @RequireWritePermission('specialties')
  @Patch('info-sections/:id')
  updateInfoSection(
    @Param('id') id: string,
    @Body() updateInfoSectionDto: UpdateSpecialtyInfoSectionDto,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyInfoSectionResponseDto>(
      this.providerDirectoryClient,
      'specialties.updateInfoSection',
      {
        id,
        data: updateInfoSectionDto,
      },
    );
  }

  @RequireDeletePermission('specialties')
  @Delete('info-sections/:id')
  deleteInfoSection(
    @Param('id') id: string,
  ): Promise<SpecialtyInfoSectionResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyInfoSectionResponseDto>(
      this.providerDirectoryClient,
      'specialties.deleteInfoSection',
      id,
    );
  }

  @RequireWritePermission('specialties')
  @Post()
  create(
    @Body() createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyResponseDto>(
      this.providerDirectoryClient,
      'specialties.create',
      createSpecialtyDto,
    );
  }

  // Admin only - update specialty
  @RequireWritePermission('specialties')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyResponseDto>(
      this.providerDirectoryClient,
      'specialties.update',
      {
        id,
        data: updateSpecialtyDto,
      },
    );
  }

  // Admin only - delete specialty
  @RequireDeletePermission('specialties')
  @Delete(':id')
  remove(@Param('id') id: string): Promise<SpecialtyResponseDto> {
    return this.microserviceService.sendWithTimeout<SpecialtyResponseDto>(
      this.providerDirectoryClient,
      'specialties.remove',
      id,
    );
  }
}
