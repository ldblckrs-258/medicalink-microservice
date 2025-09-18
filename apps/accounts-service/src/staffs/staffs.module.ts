import { Module } from '@nestjs/common';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { StaffRepository } from './staff.repository';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [PermissionModule],
  controllers: [StaffsController],
  providers: [StaffsService, StaffRepository],
  exports: [StaffsService, StaffRepository],
})
export class StaffsModule {}
