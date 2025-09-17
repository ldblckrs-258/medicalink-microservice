import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedError,
  NotFoundError,
  ErrorCode,
  ConflictError,
} from '@app/domain-errors';
import { AuthRepository } from './auth.repository';
import { AuthVersionRepository } from './auth-version.repository';
import { StaffAccount, StaffRole } from '../../prisma/generated/client';
import {
  CreateStaffDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  JwtPayloadDto,
  StaffAccountDto,
  ChangePasswordDto,
  ChangePasswordResponseDto,
} from '@app/contracts';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authVersionRepository: AuthVersionRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateStaff(email: string, password: string): Promise<StaffAccount> {
    const staff = await this.authRepository.findByEmail(email);

    if (!staff) {
      throw new NotFoundError('User not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, staff.passwordHash);

    if (isPasswordValid) {
      return staff;
    } else {
      throw new UnauthorizedError('Invalid credentials', {
        code: ErrorCode.PASSWORD_INCORRECT,
      });
    }
  }

  async login(staff: StaffAccount): Promise<Omit<LoginResponseDto, 'user'>> {
    // Get or create auth version for cache invalidation
    const authVersion = await this.authVersionRepository.getOrCreateAuthVersion(
      staff.id,
    );

    const payload: JwtPayloadDto = {
      email: staff.email,
      sub: staff.id,
      tenant: 'global', // Default tenant, can be customized per organization
      ver: authVersion,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET', {
        infer: true,
      }),
      expiresIn: +this.configService.getOrThrow<number>('JWT_EXPIRES_IN', {
        infer: true,
      }),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET', {
        infer: true,
      }),
      expiresIn: +this.configService.getOrThrow<number>(
        'JWT_REFRESH_EXPIRES_IN',
        {
          infer: true,
        },
      ),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    if (!refreshToken || refreshToken.trim() === '') {
      throw new UnauthorizedError('Refresh token is required', {
        code: ErrorCode.AUTH_REQUIRED,
      });
    }

    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', {
          infer: true,
        }),
      });
    } catch (_error) {
      throw new UnauthorizedError('Invalid or expired refresh token', {
        code: ErrorCode.AUTH_REQUIRED,
      });
    }

    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Invalid refresh token', {
        code: ErrorCode.AUTH_REQUIRED,
      });
    }

    const staff = await this.authRepository.findById(payload.sub as string);

    if (!staff) {
      throw new NotFoundError('User not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    const loginResult = await this.login(staff);
    return {
      access_token: loginResult.access_token,
      refresh_token: loginResult.refresh_token,
    };
  }

  async createStaff(createStaffDto: CreateStaffDto): Promise<StaffAccount> {
    const isEmailUnique = await this.authRepository.validateEmailUnique(
      createStaffDto.email,
    );

    if (!isEmailUnique) {
      throw new ConflictError(`Email is already registered`, {
        code: ErrorCode.USER_EMAIL_TAKEN,
      });
    }

    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);

    const staffData = {
      fullName: createStaffDto.fullName,
      email: createStaffDto.email,
      passwordHash: hashedPassword,
      role: createStaffDto.role || StaffRole.DOCTOR,
      phone: createStaffDto.phone,
      isMale: createStaffDto.isMale,
      dateOfBirth: createStaffDto.dateOfBirth,
    };

    const staff = await this.authRepository.create(staffData);

    return staff;
  }

  async getStaffProfile(staffId: string): Promise<StaffAccountDto | null> {
    const staff = await this.authRepository.findStaffWithProfile(staffId);

    if (!staff) {
      throw new NotFoundError('User not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

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

  // Additional methods using repository
  async getAllStaff() {
    return await this.authRepository.findActiveStaff();
  }

  async getStaffByRole(role: StaffRole) {
    return await this.authRepository.findStaffByRole(role);
  }

  async searchStaff(query: string) {
    return await this.authRepository.searchStaff(query);
  }

  async changePassword(staffId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.authRepository.updatePassword(staffId, hashedPassword);
  }

  async changePasswordWithValidation(
    staffId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    // Get the current staff record
    const staff = await this.authRepository.findById(staffId);

    if (!staff) {
      throw new NotFoundError('User not found', {
        code: ErrorCode.USER_NOT_FOUND,
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      staff.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect', {
        code: ErrorCode.PASSWORD_INCORRECT,
      });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.authRepository.updatePassword(staffId, hashedNewPassword);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async getStaffStatistics() {
    const [totalStaff, staffByRole] = await Promise.all([
      this.authRepository.count({ deletedAt: null }),
      this.authRepository.countStaffByRole(),
    ]);

    return {
      totalStaff,
      staffByRole,
    };
  }
}
