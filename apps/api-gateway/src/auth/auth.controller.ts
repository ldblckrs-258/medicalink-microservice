import { Body, Controller, Inject, Post, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
  RequireUserManagement,
} from '@app/contracts';
import { MicroserviceService } from '../utils/microservice.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.microserviceService.sendWithTimeout<LoginResponseDto>(
      this.accountsClient,
      'auth.login',
      loginDto,
    );
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.microserviceService.sendWithTimeout<RefreshTokenResponseDto>(
      this.accountsClient,
      'auth.refresh',
      refreshTokenDto,
    );
  }

  @RequireUserManagement()
  @Post('register')
  async register(
    @Body() createStaffDto: CreateStaffDto,
  ): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'auth.register',
      createStaffDto,
    );
  }

  @Get('profile')
  async getProfile(
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<StaffAccountDto> {
    return this.microserviceService.sendWithTimeout<StaffAccountDto>(
      this.accountsClient,
      'auth.profile',
      { userId: user.sub },
    );
  }

  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.microserviceService.sendWithTimeout<ChangePasswordResponseDto>(
      this.accountsClient,
      'auth.change-password',
      {
        staffId: user.sub,
        changePasswordDto,
      },
    );
  }
}
