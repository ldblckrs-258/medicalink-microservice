import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorsService } from './doctors.service';
import { GetPublicListDto } from 'libs/contracts/src/dtos/provider';
import { Public } from 'libs/contracts/src/decorators/public.decorator';

@Controller()
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @MessagePattern('doctor-profile.create')
  create(@Payload() createDoctorDto: any) {
    return this.doctorsService.create(createDoctorDto);
  }

  @MessagePattern('doctor-profile.findOne')
  findOne(@Payload() id: string) {
    return this.doctorsService.findOne(String(id));
  }

  @MessagePattern('doctor-profile.update')
  async update(@Payload() updateDoctorDto: any) {
    const { id, ...data } = updateDoctorDto;
    return this.doctorsService.update(String(id), data);
  }

  @MessagePattern('doctor-profile.remove')
  async remove(@Payload() payload: any) {
    const { id } = payload;
    return this.doctorsService.remove(String(id));
  }

  @MessagePattern('doctor-profile.toggleActive')
  async toggleActive(@Payload() payload: any) {
    const { id, isActive } = payload;
    const active: boolean | undefined =
      typeof isActive === 'boolean' ? isActive : undefined;

    return this.doctorsService.toggleActive(String(id), active);
  }

  @Public()
  @MessagePattern('doctor-profile.getPublicList')
  findAll(@Payload() filters?: GetPublicListDto) {
    return this.doctorsService.getPublicList(filters);
  }
}
