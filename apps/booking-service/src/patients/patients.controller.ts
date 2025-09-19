import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import type {
  CreatePatientDto,
  PatientDto,
  UpdatePatientDto,
} from '@app/contracts';

@Controller()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @MessagePattern('patients.create')
  create(@Payload() createPatientDto: CreatePatientDto): Promise<PatientDto> {
    return this.patientsService.create(createPatientDto);
  }

  @MessagePattern('patients.findAll')
  findAll(): Promise<PatientDto[]> {
    return this.patientsService.findAll();
  }

  @MessagePattern('patients.findOne')
  findOne(@Payload() id: string): Promise<PatientDto | null> {
    return this.patientsService.findOne(String(id));
  }

  @MessagePattern('patients.update')
  update(@Payload() updatePatientDto: UpdatePatientDto): Promise<PatientDto> {
    return this.patientsService.update(updatePatientDto.id, updatePatientDto);
  }

  @MessagePattern('patients.remove')
  remove(@Payload() id: string): Promise<PatientDto> {
    return this.patientsService.remove(String(id));
  }
}
