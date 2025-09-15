import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@app/repositories';
import {
  CreateStaffAccountDto,
  UpdateStaffAccountDto,
  StaffAccountFilterOptions,
} from '@app/contracts';
import { PrismaService } from '../../prisma/prisma.service';
import { StaffAccount, StaffRole } from '../../prisma/generated/client';

@Injectable()
export class AuthRepository extends BaseRepository<
  StaffAccount,
  CreateStaffAccountDto,
  UpdateStaffAccountDto,
  StaffAccountFilterOptions
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.staffAccount);
  }

  // Custom methods specific to Staff authentication
  async findByEmail(email: string): Promise<StaffAccount | null> {
    return await this.model.findUnique({
      where: { email },
    });
  }

  async findActiveStaff(): Promise<StaffAccount[]> {
    return await this.model.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStaffByRole(role: StaffRole): Promise<StaffAccount[]> {
    return await this.model.findMany({
      where: { role, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchStaff(query: string): Promise<StaffAccount[]> {
    return await this.model.findMany({
      where: {
        AND: [
          { deletedAt: null },
          {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePassword(
    id: string,
    passwordHash: string,
  ): Promise<StaffAccount> {
    return await this.model.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async findStaffWithProfile(id: string): Promise<StaffAccount | null> {
    return await this.model.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
        isMale: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      },
    });
  }

  async countStaffByRole(): Promise<Record<StaffRole, number>> {
    const result = await this.model.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const counts: Record<StaffRole, number> = {
      [StaffRole.SUPER_ADMIN]: 0,
      [StaffRole.ADMIN]: 0,
      [StaffRole.DOCTOR]: 0,
    };

    result.forEach((item) => {
      counts[item.role] = item._count.id;
    });

    return counts;
  }

  async validateEmailUnique(
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: any = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.model.count({ where });
    return count === 0;
  }
}
