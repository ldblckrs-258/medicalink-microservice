import { Body, Controller, Inject, Post, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
  StaffAccountDto,
  JwtPayloadDto,
  ChangePasswordResponseDto,
} from '@app/contracts';
import {
  LoginDto,
  RefreshTokenDto,
  CreateStaffDto,
  ChangePasswordDto,
  Public,
  CurrentUser,
  Roles,
} from '@app/contracts';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await firstValueFrom(
      this.accountsClient.send<LoginResponseDto>('auth.login', loginDto),
    );
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return firstValueFrom(
      this.accountsClient.send<RefreshTokenResponseDto>(
        'auth.refresh',
        refreshTokenDto,
      ),
    );
  }

  @Roles('SUPER_ADMIN')
  @Post('register')
  async register(
    @Body() createStaffDto: CreateStaffDto,
  ): Promise<StaffAccountDto> {
    return await firstValueFrom(
      this.accountsClient.send<StaffAccountDto>(
        'auth.register',
        createStaffDto,
      ),
    );
  }

  @Get('profile')
  async getProfile(
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    return firstValueFrom(
      this.accountsClient.send<StaffAccountDto>('auth.profile', {
        userId: user.sub,
      }),
    );
  }

  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<ChangePasswordResponseDto> {
    return firstValueFrom(
      this.accountsClient.send<ChangePasswordResponseDto>(
        'auth.change-password',
        {
          staffId: user.sub,
          changePasswordDto,
        },
      ),
    );
  }
}
