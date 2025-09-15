import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDoctorDto: any) {
    return this.prisma.doctor.create({
      data: {
        id: createId(),
        ...createDoctorDto,
      },
    });
  }

  async findAll(filters?: any) {
    const where: any = {};

    if (filters?.specialty) {
      where.doctorSpecialties = {
        some: {
          specialty: {
            slug: filters.specialty,
          },
        },
      };
    }

    if (filters?.location) {
      where.doctorWorkLocations = {
        some: {
          location: {
            id: filters.location,
          },
        },
      };
    }

    return this.prisma.doctor.findMany({
      where,
      include: {
        doctorSpecialties: {
          include: { specialty: true },
        },
        doctorWorkLocations: {
          include: { location: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.doctor.findUnique({
      where: { id },
      include: {
        doctorSpecialties: {
          include: { specialty: true },
        },
        doctorWorkLocations: {
          include: { location: true },
        },
        schedules: {
          where: {
            serviceDate: { gte: new Date() },
          },
        },
      },
    });
  }

  async update(id: string, updateDoctorDto: any) {
    return this.prisma.doctor.update({
      where: { id },
      data: updateDoctorDto,
    });
  }

  async remove(id: string) {
    // For now, we'll delete the record completely
    // Later you can implement soft delete with deletedAt
    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}
