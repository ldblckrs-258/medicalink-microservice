import { Module } from '@nestjs/common';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { StaffRepository } from './staff.repository';

@Module({
  controllers: [StaffsController],
  providers: [StaffsService, StaffRepository],
  exports: [StaffsService, StaffRepository],
})
export class StaffsModule {}
