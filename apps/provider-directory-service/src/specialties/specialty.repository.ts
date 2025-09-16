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

  async findMany(
    query: SpecialtyQueryDto,
  ): Promise<{ data: any[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name',
      sortOrder = 'DESC',
      isActive,
      includeMetadata = false,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.SpecialtyWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Admin can filter by isActive status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: Prisma.SpecialtyOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder.toLowerCase() as Prisma.SortOrder;

    // Determine what fields to select based on includeMetadata
    const selectFields = includeMetadata
      ? undefined // Select all fields when includeMetadata is true
      : {
          id: true,
          name: true,
          slug: true,
          description: true,
          // Exclude isActive, createdAt, updatedAt when includeMetadata is false
        };

    const [data, total] = await Promise.all([
      this.prisma.specialty.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: selectFields,
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
