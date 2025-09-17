import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PermissionController } from './permission.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthVersionRepository } from './auth-version.repository';
import { PermissionRepository } from './permission.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET', {
          infer: true,
        }),
        signOptions: {
          expiresIn: +configService.getOrThrow<number>('JWT_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, PermissionController],
  providers: [
    AuthService,
    AuthRepository,
    AuthVersionRepository,
    PermissionRepository,
  ],
  exports: [
    AuthService,
    AuthRepository,
    AuthVersionRepository,
    PermissionRepository,
  ],
})
export class AuthModule {}
