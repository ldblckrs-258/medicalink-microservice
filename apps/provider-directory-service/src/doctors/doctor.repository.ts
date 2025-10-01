import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import {
  CreateDoctorProfileDto,
  DoctorProfileQueryDto,
  DoctorProfileResponseDto,
} from '@app/contracts';

@Injectable()
export class DoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateDoctorProfileDto,
  ): Promise<DoctorProfileResponseDto> {
    const result = await this.prisma.doctor.create({
      data: {
        id: createId(),
        ...data,
      },
    });
    return result as unknown as DoctorProfileResponseDto;
  }

  async findAll(
    where: any = {},
    include: any = {},
  ): Promise<DoctorProfileResponseDto[]> {
    const results = await this.prisma.doctor.findMany({ where, include });
    return results as unknown as DoctorProfileResponseDto[];
  }

  async findManyPublic(
    where: any = {},
    include: any = {},
    query?: DoctorProfileQueryDto,
  ): Promise<{ data: DoctorProfileResponseDto[]; total: number }> {
    const { page = 1, limit = 10, sortOrder = 'desc' } = query ?? {};
    const orderBy = {
      createdAt: sortOrder === 'asc' ? ('asc' as const) : ('desc' as const),
    };

    // Always filter by isActive = true for public list
    const publicWhere = {
      ...where,
      isActive: true,
    };

    const [data, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where: publicWhere,
        include,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.doctor.count({ where: publicWhere }),
    ]);

    return {
      data: data as unknown as DoctorProfileResponseDto[],
      total,
    };
  }

  async findOne(
    id: string,
    include: any = {},
  ): Promise<DoctorProfileResponseDto | null> {
    const result = await this.prisma.doctor.findUnique({
      where: { id },
      include,
    });
    return result as unknown as DoctorProfileResponseDto | null;
  }

  async findOneByStaffAccountId(
    where: any,
    include: any = {},
  ): Promise<DoctorProfileResponseDto | null> {
    const result = await this.prisma.doctor.findUnique({ where, include });
    return result as unknown as DoctorProfileResponseDto | null;
  }

  async update(
    id: string,
    data: Partial<CreateDoctorProfileDto>,
  ): Promise<DoctorProfileResponseDto> {
    const result = await this.prisma.doctor.update({ where: { id }, data });
    return result as unknown as DoctorProfileResponseDto;
  }

  async remove(id: string): Promise<DoctorProfileResponseDto> {
    const result = await this.prisma.doctor.delete({ where: { id } });
    return result as unknown as DoctorProfileResponseDto;
  }

  async toggleActive(
    id: string,
    active?: boolean,
  ): Promise<DoctorProfileResponseDto | null> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!doctor) return null;
    const newVal = typeof active === 'boolean' ? active : !doctor.isActive;
    const result = await this.prisma.doctor.update({
      where: { id },
      data: { isActive: newVal },
    });
    return result as unknown as DoctorProfileResponseDto;
  }
}
