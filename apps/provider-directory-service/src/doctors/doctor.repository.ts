import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { GetPublicListDto } from 'libs/contracts/src/dtos/provider';

@Injectable()
export class DoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.doctor.create({
      data: {
        id: createId(),
        ...data,
      },
    });
  }

  async findAll(where: any = {}, include: any = {}) {
    return this.prisma.doctor.findMany({ where, include });
  }

  async findManyPublic(
    where: any = {},
    include: any = {},
    query?: GetPublicListDto,
  ): Promise<{ data: any[]; total: number }> {
    // const { page = 1, limit = 10, sortOrder = 'DESC' } = query ?? {};
    // const orderBy = {
    //   createdAt: sortOrder === 'ASC' ? 'asc' : 'desc',
    // } as const;
    await new Promise((resolve) => setTimeout(resolve, 1));
    console.log(where, include, query);

    // const [data, total] = await Promise.all([
    //   this.prisma.doctor.findMany({
    //     where,
    //     include,
    //     skip: (page - 1) * limit,
    //     take: limit,
    //     orderBy,
    //   }),
    //   this.prisma.doctor.count({ where }),
    // ]);

    // return { data, total };
    return { data: [], total: -1 };
  }

  async findOne(id: string, include: any = {}) {
    return this.prisma.doctor.findUnique({ where: { id }, include });
  }

  async update(id: string, data: any) {
    return this.prisma.doctor.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.doctor.delete({ where: { id } });
  }

  async toggleActive(id: string, active?: boolean) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!doctor) return null;
    const newVal = typeof active === 'boolean' ? active : !doctor.isActive;
    return this.prisma.doctor.update({
      where: { id },
      data: { isActive: newVal },
    });
  }
}
