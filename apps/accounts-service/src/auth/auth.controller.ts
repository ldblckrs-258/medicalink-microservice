import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import type {
  ChangePasswordDto,
  ChangePasswordResponseDto,
  CreateStaffDto,
  LoginDto,
  LoginResponseDto,
  PostResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  StaffAccountDto,
} from '@app/contracts';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto): Promise<LoginResponseDto> {
    const staff = await this.authService.validateStaff(
      loginDto.email,
      loginDto.password,
    );

    const tokens = await this.authService.login(staff);

    return {
      ...tokens,
      user: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        isMale: staff.isMale,
        dateOfBirth: staff.dateOfBirth,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    };
  }

  @MessagePattern('auth.refresh')
  async refreshToken(
    @Payload() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return await this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @MessagePattern('auth.register')
  async register(
    @Payload() createStaffDto: CreateStaffDto,
  ): Promise<StaffAccountDto> {
    const staff = await this.authService.createStaff(createStaffDto);

    return {
      id: staff.id,
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role,
      phone: staff.phone,
      isMale: staff.isMale,
      dateOfBirth: staff.dateOfBirth,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }

  @MessagePattern('auth.profile')
  async getProfile(
    @Payload() payload: { userId: string },
  ): Promise<StaffAccountDto | null> {
    return this.authService.getStaffProfile(payload.userId);
  }

  @MessagePattern('auth.change-password')
  async changePassword(
    @Payload()
    payload: {
      staffId: string;
      changePasswordDto: ChangePasswordDto;
    },
  ): Promise<ChangePasswordResponseDto> {
    return this.authService.changePasswordWithValidation(
      payload.staffId,
      payload.changePasswordDto,
    );
  }

  @MessagePattern('auth.verify-password')
  async verifyPassword(
    @Payload()
    payload: {
      email: string;
      password: string;
    },
  ): Promise<PostResponseDto> {
    return this.authService.verifyPassword(payload.email, payload.password);
  }
}
