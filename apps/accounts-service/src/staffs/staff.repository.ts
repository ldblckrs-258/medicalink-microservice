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
}
