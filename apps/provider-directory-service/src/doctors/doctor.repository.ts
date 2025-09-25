import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';

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
