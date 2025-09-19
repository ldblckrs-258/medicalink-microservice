import { Module } from '@nestjs/common';
import { DoctorAccountsController } from './doctor-accounts.controller';
import { DoctorAccountsService } from './doctor-accounts.service';
import { StaffRepository } from '../staffs/staff.repository';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [PermissionModule],
  controllers: [DoctorAccountsController],
  providers: [DoctorAccountsService, StaffRepository],
  exports: [DoctorAccountsService],
})
export class DoctorAccountsModule {}
