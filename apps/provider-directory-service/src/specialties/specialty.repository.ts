import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Specialty, Prisma } from '../../prisma/generated/client';
import {
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  SpecialtyQueryDto,
} from '@app/contracts';
import { slugify } from '../utils/slugify';

@Injectable()
export class SpecialtyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: SpecialtyQueryDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'desc',
      isActive,
      includeMetadata: _includeMetadata,
    } = query ?? {};

    const where: Prisma.SpecialtyWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Prisma.SpecialtyOrderByWithRelationInput = {
      [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.specialty.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.specialty.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Specialty | null> {
    return this.prisma.specialty.findUnique({
      where: { id },
    });
  }

  async findByIdWithInfoSectionsCount(
    id: string,
  ): Promise<(Specialty & { _count: { infoSections: number } }) | null> {
    return this.prisma.specialty.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            infoSections: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Specialty | null> {
    return this.prisma.specialty.findUnique({
      where: { name },
    });
  }

  async findBySlug(slug: string): Promise<Specialty | null> {
    return this.prisma.specialty.findUnique({
      where: { slug },
    });
  }

  async findBySlugWithInfoSections(
    slug: string,
  ): Promise<(Specialty & { infoSections: any[] }) | null> {
    return this.prisma.specialty.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        infoSections: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async create(data: CreateSpecialtyDto): Promise<Specialty> {
    const slug = slugify(data.name);

    return this.prisma.specialty.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
  }

  async update(id: string, data: UpdateSpecialtyDto): Promise<Specialty> {
    const updateData: Prisma.SpecialtyUpdateInput = {
      name: data.name,
      description: data.description,
    };

    if (data.name) {
      updateData.slug = slugify(data.name);
    }

    return this.prisma.specialty.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Specialty> {
    return this.prisma.specialty.delete({
      where: { id },
    });
  }

  async getStats(): Promise<{
    total: number;
    recentlyCreated: number;
  }> {
    // Get start of current week (Monday)
    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const total = await this.prisma.specialty.count();

    const recentlyCreated = await this.prisma.specialty.count({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    return {
      total,
      recentlyCreated,
    };
  }
}
