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

  async findManyWithMetadata(
    query: SpecialtyQueryDto,
  ): Promise<{ data: any[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'DESC',
      isActive,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.SpecialtyWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Prisma.SpecialtyOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder.toLowerCase() as Prisma.SortOrder;

    const [data, total] = await Promise.all([
      this.prisma.specialty.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              infoSections: true,
            },
          },
        },
      }),
      this.prisma.specialty.count({ where }),
    ]);

    // Map data to include infoSectionsCount
    const mappedData = data.map((specialty) => ({
      ...specialty,
      infoSectionsCount: specialty._count.infoSections,
    }));

    return { data: mappedData, total };
  }

  async findManyPublic(
    query: SpecialtyQueryDto,
  ): Promise<{ data: any[]; total: number }> {
    const { page = 1, limit = 10, search } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.SpecialtyWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      // Simplified query without select to avoid field issues
      const [allData, total] = await Promise.all([
        this.prisma.specialty.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            name: 'asc',
          },
        }),
        this.prisma.specialty.count({ where }),
      ]);

      // Map to only include public fields
      const data = allData.map((specialty) => ({
        id: specialty.id,
        name: specialty.name,
        slug: specialty.slug,
        description: specialty.description,
      }));

      return { data, total };
    } catch (error) {
      console.error('Prisma query error in findManyPublic:', error);
      console.error('Query params:', { page, limit, search, where, skip });
      throw error;
    }
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
