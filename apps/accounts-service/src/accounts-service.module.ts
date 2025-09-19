import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StaffsModule } from './staffs/staffs.module';
import { DoctorAccountsModule } from './doctor-accounts/doctor-accounts.module';
import { PermissionModule } from './permission/permission.module';
import { AuthVersionModule } from './auth-version/auth-version.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    PrismaModule,
    AuthModule,
    StaffsModule,
    DoctorAccountsModule,
    PermissionModule,
    AuthVersionModule,
  ],
})
export class AccountsServiceModule {}
