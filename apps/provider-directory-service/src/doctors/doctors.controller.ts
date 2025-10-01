import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorsService } from './doctors.service';
import {
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  DoctorProfileQueryDto,
  GetDoctorsByAccountIdsDto,
  ToggleDoctorActiveDto,
  Public,
} from '@app/contracts';

@Controller()
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @MessagePattern('doctor-profile.create')
  create(@Payload() createDoctorDto: CreateDoctorProfileDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @MessagePattern('doctor-profile.createEmpty')
  createEmpty(@Payload() payload: { staffAccountId: string }) {
    return this.doctorsService.createEmpty(payload.staffAccountId);
  }

  @MessagePattern('doctor-profile.findOne')
  findOne(@Payload() id: string) {
    return this.doctorsService.findOne(String(id));
  }

  @MessagePattern('doctor-profile.update')
  async update(@Payload() updateDoctorDto: UpdateDoctorProfileDto) {
    const { id, ...data } = updateDoctorDto;
    return this.doctorsService.update(String(id), data);
  }

  @MessagePattern('doctor-profile.remove')
  async remove(@Payload() payload: { id: string }) {
    const { id } = payload;
    return this.doctorsService.remove(String(id));
  }

  @MessagePattern('doctor-profile.toggleActive')
  async toggleActive(@Payload() payload: ToggleDoctorActiveDto) {
    const { id, isActive } = payload;
    return this.doctorsService.toggleActive(String(id), isActive);
  }

  @Public()
  @MessagePattern('doctor-profile.getPublicList')
  findAll(@Payload() filters?: DoctorProfileQueryDto) {
    return this.doctorsService.getPublicList(filters);
  }

  @MessagePattern('doctor-profile.getByAccountId')
  async getByAccountId(@Payload() payload: { staffAccountId: string }) {
    return this.doctorsService.getByAccountId(payload.staffAccountId);
  }

  @MessagePattern('doctor-profile.getByAccountIds')
  getByAccountIds(@Payload() payload: GetDoctorsByAccountIdsDto) {
    return this.doctorsService.getByAccountIds(payload);
  }
}
