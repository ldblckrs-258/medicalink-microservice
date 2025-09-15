import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { PatientDto, JwtPayloadDto } from '@app/contracts';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PaginationDto,
  Roles,
  CurrentUser,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('patients')
export class PatientsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Roles('ADMIN', 'DOCTOR')
  @Post()
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PatientDto> {
    return this.microserviceService.sendWithTimeout<PatientDto>(
      this.accountsClient,
      'patients.create',
      {
        ...createPatientDto,
        createdBy: user.sub,
      },
    );
  }

  @Roles('ADMIN', 'DOCTOR')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PatientDto[]> {
    return this.microserviceService.sendWithTimeout<PatientDto[]>(
      this.accountsClient,
      'patients.findAll',
      paginationDto,
      { timeoutMs: 15000 },
    );
  }

  @Roles('ADMIN', 'DOCTOR')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PatientDto> {
    return this.microserviceService.sendWithTimeout<PatientDto>(
      this.accountsClient,
      'patients.findOne',
      id,
    );
  }

  @Roles('ADMIN', 'DOCTOR')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PatientDto> {
    return this.microserviceService.sendWithTimeout<PatientDto>(
      this.accountsClient,
      'patients.update',
      {
        ...updatePatientDto,
        id,
        updatedBy: user.sub,
      },
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PatientDto> {
    return this.microserviceService.sendWithTimeout<PatientDto>(
      this.accountsClient,
      'patients.remove',
      {
        id,
        deletedBy: user.sub,
      },
    );
  }
}
