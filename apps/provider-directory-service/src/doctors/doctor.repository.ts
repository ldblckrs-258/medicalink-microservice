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

  /**
   * Transform doctor data with nested relations to flat response DTO
   */
  private transformDoctorResponse(doctor: any): DoctorProfileResponseDto {
    return {
      ...doctor,
      specialties:
        doctor.doctorSpecialties?.map((ds: any) => ds.specialty) ?? [],
      workLocations:
        doctor.doctorWorkLocations?.map((dwl: any) => dwl.location) ?? [],
      doctorSpecialties: undefined,
      doctorWorkLocations: undefined,
    } as DoctorProfileResponseDto;
  }

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
    const results = await this.prisma.doctor.findMany({
      where,
      include: {
        doctorSpecialties: { include: { specialty: true } },
        doctorWorkLocations: { include: { location: true } },
        ...include,
      },
    });
    return results.map((doctor) => this.transformDoctorResponse(doctor));
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
        include: {
          doctorSpecialties: { include: { specialty: true } },
          doctorWorkLocations: { include: { location: true } },
          ...include,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      this.prisma.doctor.count({ where: publicWhere }),
    ]);

    return {
      data: data.map((doctor) => this.transformDoctorResponse(doctor)),
      total,
    };
  }

  async findOne(
    id: string,
    include: any = {},
  ): Promise<DoctorProfileResponseDto | null> {
    const result = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        doctorSpecialties: { include: { specialty: true } },
        doctorWorkLocations: { include: { location: true } },
        ...include,
      },
    });
    return result ? this.transformDoctorResponse(result) : null;
  }

  async findOneByStaffAccountId(
    where: any,
    include: any = {},
  ): Promise<DoctorProfileResponseDto | null> {
    const result = await this.prisma.doctor.findUnique({
      where,
      include: {
        doctorSpecialties: { include: { specialty: true } },
        doctorWorkLocations: { include: { location: true } },
        ...include,
      },
    });
    return result ? this.transformDoctorResponse(result) : null;
  }

  /**
   * Update doctor profile with optimized relationship management
   *
   * Algorithm for updating many-to-many relationships:
   * 1. deleteMany: Remove relationships NOT IN new list (O(1) query)
   * 2. createMany with skipDuplicates: Insert all new IDs (O(1) query)
   *    - Relies on unique constraint (doctorId, specialtyId/locationId)
   *    - Automatically skips existing relationships
   *    - No need to diff current vs new IDs
   *
   * Benefits:
   * - Only 2 queries per relationship type (vs N queries for diff approach)
   * - Transaction ensures atomicity
   * - Leverages database constraints for duplicate detection
   */
  async update(
    id: string,
    data: Partial<CreateDoctorProfileDto> & {
      specialtyIds?: string[];
      locationIds?: string[];
    },
  ): Promise<DoctorProfileResponseDto> {
    const { specialtyIds, locationIds, ...doctorData } = data;

    // Update doctor basic data and relationships in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      if (Array.isArray(specialtyIds)) {
        await tx.doctorSpecialty.deleteMany({
          where: {
            doctorId: id,
            specialtyId: { notIn: specialtyIds },
          },
        });

        if (specialtyIds.length > 0) {
          await tx.doctorSpecialty.createMany({
            data: specialtyIds.map((specialtyId) => ({
              id: createId(),
              doctorId: id,
              specialtyId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Update work location relationships if provided
      if (Array.isArray(locationIds)) {
        await tx.doctorWorkLocation.deleteMany({
          where: {
            doctorId: id,
            locationId: { notIn: locationIds },
          },
        });

        if (locationIds.length > 0) {
          await tx.doctorWorkLocation.createMany({
            data: locationIds.map((locationId) => ({
              id: createId(),
              doctorId: id,
              locationId,
            })),
            skipDuplicates: true,
          });
        }
      }

      // Update doctor basic data
      return tx.doctor.update({
        where: { id },
        data: doctorData,
        include: {
          doctorSpecialties: {
            include: { specialty: true },
          },
          doctorWorkLocations: {
            include: { location: true },
          },
        },
      });
    });

    return this.transformDoctorResponse(result);
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
      include: {
        doctorSpecialties: { include: { specialty: true } },
        doctorWorkLocations: { include: { location: true } },
      },
    });
    return this.transformDoctorResponse(result);
  }
}
