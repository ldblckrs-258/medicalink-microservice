import { Body, Controller, Inject, Post, Get, HttpCode } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IStaffAccount } from '@app/contracts/interfaces';
import type {
  LoginResponseDto,
  RefreshTokenResponseDto,
  JwtPayloadDto,
  ChangePasswordResponseDto,
  PostResponseDto,
} from '@app/contracts';
import {
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  VerifyPasswordDto,
  Public,
  CurrentUser,
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

  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayloadDto): Promise<IStaffAccount> {
    return this.microserviceService.sendWithTimeout<IStaffAccount>(
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

  @Post('verify-password')
  @HttpCode(200)
  async verifyPassword(
    @Body() verifyPasswordDto: VerifyPasswordDto,
    @CurrentUser() user: JwtPayloadDto,
  ): Promise<PostResponseDto> {
    return this.microserviceService.sendWithTimeout<PostResponseDto>(
      this.accountsClient,
      'auth.verify-password',
      {
        email: user.email,
        password: verifyPasswordDto.password,
      },
    );
  }
}
