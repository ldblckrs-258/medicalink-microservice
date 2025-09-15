import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorsService } from './doctors.service';

@Controller()
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @MessagePattern('doctors.create')
  create(@Payload() createDoctorDto: any) {
    return this.doctorsService.create(createDoctorDto);
  }

  @MessagePattern('doctors.findAll')
  findAll(@Payload() filters?: any) {
    return this.doctorsService.findAll(filters);
  }

  @MessagePattern('doctors.findOne')
  findOne(@Payload() id: string) {
    return this.doctorsService.findOne(String(id));
  }

  @MessagePattern('doctors.update')
  update(@Payload() updateDoctorDto: any) {
    return this.doctorsService.update(
      String(updateDoctorDto.id),
      updateDoctorDto,
    );
  }

  @MessagePattern('doctors.remove')
  remove(@Payload() id: string) {
    return this.doctorsService.remove(String(id));
  }
}
