import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { BlogResponseDto, BlogCategoryResponseDto } from '@app/contracts';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBlog(data: {
    title: string;
    content: string;
    authorId: string;
    categoryId: string;
    status?: 'DRAFT' | 'PUBLISHED';
  }): Promise<BlogResponseDto> {
    const blog = await this.prisma.blog.create({
      data: {
        id: createId(),
        title: data.title,
        content: data.content,
        slug: this.generateSlug(data.title),
        status: data.status ?? 'DRAFT',
        authorId: data.authorId,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return this.transformBlogResponse(blog);
  }

  async findAllBlogs(params: {
    page: number;
    limit: number;
    categoryId?: string;
    authorId?: string;
    status?: string;
  }) {
    const { page, limit, categoryId, authorId, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (status) where.status = status;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data: blogs.map((blog) => this.transformBlogResponse(blog)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBlogById(id: string): Promise<BlogResponseDto | null> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return blog ? this.transformBlogResponse(blog) : null;
  }

  async updateBlog(
    id: string,
    data: {
      title?: string;
      content?: string;
      categoryId?: string;
      status?: string;
    },
  ): Promise<BlogResponseDto> {
    const updateData: any = {};
    if (data.title) {
      updateData.title = data.title;
      updateData.slug = this.generateSlug(data.title);
    }
    if (data.content) {
      updateData.content = data.content;
    }
    if (data.categoryId) {
      updateData.categoryId = data.categoryId;
    }
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }

    const blog = await this.prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return this.transformBlogResponse(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    await this.prisma.blog.delete({
      where: { id },
    });
  }

  async createCategory(data: {
    name: string;
  }): Promise<BlogCategoryResponseDto> {
    const category = await this.prisma.blogCategory.create({
      data: {
        id: createId(),
        name: data.name,
        slug: this.generateSlug(data.name),
      },
    });

    return this.transformCategoryResponse(category);
  }

  async findAllCategories(): Promise<BlogCategoryResponseDto[]> {
    const categories = await this.prisma.blogCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((category) =>
      this.transformCategoryResponse(category),
    );
  }

  async findCategoryById(id: string): Promise<BlogCategoryResponseDto | null> {
    const category = await this.prisma.blogCategory.findUnique({
      where: { id },
    });

    return category ? this.transformCategoryResponse(category) : null;
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
    },
  ): Promise<BlogCategoryResponseDto> {
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = this.generateSlug(data.name);
    }

    const category = await this.prisma.blogCategory.update({
      where: { id },
      data: updateData,
    });

    return this.transformCategoryResponse(category);
  }

  async countBlogsByCategory(categoryId: string): Promise<number> {
    return this.prisma.blog.count({ where: { categoryId } });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.prisma.blogCategory.delete({ where: { id } });
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 220);
  }

  private transformBlogResponse(blog: any): BlogResponseDto {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      authorId: blog.authorId,
      categoryId: blog.categoryId,
      category: blog.category
        ? {
            id: blog.category.id,
            name: blog.category.name,
            description: undefined,
          }
        : undefined,
      status: blog.status,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  }

  private transformCategoryResponse(category: any): BlogCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
