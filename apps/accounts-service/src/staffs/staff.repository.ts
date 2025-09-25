import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StaffAccount, Prisma } from '../../prisma/generated/client';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from '@app/contracts';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    query: StaffQueryDto,
  ): Promise<{ data: StaffAccount[]; total: number }> {
    const {
      skip = 0,
      limit = 10,
      role,
      search,
      email,
      isMale,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.StaffAccountWhereInput = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (typeof isMale === 'boolean') {
      where.isMale = isMale;
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo);
      }
    }

    const orderBy: Prisma.StaffAccountOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [data, total] = await Promise.all([
      this.prisma.staffAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.staffAccount.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<StaffAccount | null> {
    return this.prisma.staffAccount.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string): Promise<StaffAccount | null> {
    return this.prisma.staffAccount.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateStaffDto): Promise<StaffAccount> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.staffAccount.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        phone: data.phone,
        isMale: data.isMale,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });
  }

  async update(id: string, data: UpdateStaffDto): Promise<StaffAccount> {
    const updateData: Prisma.StaffAccountUpdateInput = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      isMale: data.isMale,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.role) {
      updateData.role = data.role;
    }

    return this.prisma.staffAccount.update({
      where: { id },
      data: updateData,
    });
  }

  async softDelete(id: string): Promise<StaffAccount> {
    return this.prisma.staffAccount.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getStats(): Promise<{
    total: number;
    byRole: { SUPER_ADMIN: number; ADMIN: number; DOCTOR: number };
    recentlyCreated: number;
    deleted: number;
  }> {
    // Get start of current week (Monday)
    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Get total active staffs
    const total = await this.prisma.staffAccount.count({
      where: {
        deletedAt: null,
      },
    });

    // Get count by role for active staffs
    const roleStats = await this.prisma.staffAccount.groupBy({
      by: ['role'],
      where: {
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    // Initialize byRole with 0 values
    const byRole = {
      SUPER_ADMIN: 0,
      ADMIN: 0,
      DOCTOR: 0,
    };

    // Populate with actual counts
    roleStats.forEach((stat) => {
      byRole[stat.role] = stat._count.id;
    });

    // Get recently created staffs (this week)
    const recentlyCreated = await this.prisma.staffAccount.count({
      where: {
        deletedAt: null,
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // Get deleted staffs count
    const deleted = await this.prisma.staffAccount.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });

    return {
      total,
      byRole,
      recentlyCreated,
      deleted,
    };
  }
}
