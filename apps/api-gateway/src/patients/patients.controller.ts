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
import { firstValueFrom } from 'rxjs';
import type { PatientDto, JwtPayloadDto } from '@app/contracts';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PaginationDto,
  Roles,
  CurrentUser,
} from '@app/contracts';

@Controller('patients')
export class PatientsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
  ) {}

  @Roles('ADMIN', 'DOCTOR')
  @Post()
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PatientDto> {
    return firstValueFrom(
      this.accountsClient.send<PatientDto>('patients.create', {
        ...createPatientDto,
        createdBy: user.sub,
      }),
    );
  }

  @Roles('ADMIN', 'DOCTOR')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PatientDto[]> {
    return firstValueFrom(
      this.accountsClient.send<PatientDto[]>('patients.findAll', paginationDto),
    );
  }

  @Roles('ADMIN', 'DOCTOR')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PatientDto> {
    return firstValueFrom(
      this.accountsClient.send<PatientDto>('patients.findOne', id),
    );
  }

  @Roles('ADMIN', 'DOCTOR')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PatientDto> {
    return firstValueFrom(
      this.accountsClient.send<PatientDto>('patients.update', {
        ...updatePatientDto,
        id,
        updatedBy: user.sub,
      }),
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PatientDto> {
    return firstValueFrom(
      this.accountsClient.send<PatientDto>('patients.remove', {
        id,
        deletedBy: user.sub,
      }),
    );
  }
}
