import { Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  BlogResponseDto,
  BlogCategoryResponseDto,
} from '@app/contracts';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '@app/domain-errors';
import { AssetsMaintenanceService } from '../assets/assets-maintenance.service';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly assetsMaintenance: AssetsMaintenanceService,
  ) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<BlogResponseDto> {
    // Check if category exists
    if (!createBlogDto.categoryId) {
      throw new ConflictError('Category is required');
    }
    if (createBlogDto.categoryId) {
      const category = await this.blogRepository.findCategoryById(
        createBlogDto.categoryId,
      );
      if (!category) {
        throw new NotFoundError('Blog category not found');
      }
    }

    return this.blogRepository.createBlog(createBlogDto);
  }

  async getBlogs(params: {
    page: number;
    limit: number;
    categoryId?: string;
    authorId?: string;
    status?: string;
  }) {
    const result = await this.blogRepository.findAllBlogs(params);
    const hasNext = params.page * params.limit < result.total;
    const hasPrev = params.page > 1;
    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async getBlogById(id: string): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findBlogById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }
    return blog;
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto,
    authorId: string,
    isAdmin: boolean = false,
  ): Promise<BlogResponseDto> {
    const blog = await this.getBlogById(id);

    if (!isAdmin && blog.authorId !== authorId) {
      throw new ForbiddenError('You can only update your own blogs');
    }

    if (updateBlogDto.categoryId) {
      const category = await this.blogRepository.findCategoryById(
        updateBlogDto.categoryId,
      );
      if (!category) {
        throw new NotFoundError('Blog category not found');
      }
    }

    // Reconcile assets
    const prevPublicIds: string[] = Array.isArray(blog.publicIds)
      ? blog.publicIds
      : [];
    const nextPublicIds: string[] = Array.isArray(updateBlogDto.publicIds)
      ? updateBlogDto.publicIds
      : prevPublicIds;
    await this.assetsMaintenance.reconcileEntityAssets(
      prevPublicIds,
      nextPublicIds,
    );

    return this.blogRepository.updateBlog(id, updateBlogDto);
  }

  async deleteBlog(
    id: string,
    authorId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const blog = await this.getBlogById(id);

    if (!isAdmin && blog.authorId !== authorId) {
      throw new ForbiddenError('You can only delete your own blogs');
    }

    // Cleanup assets before/after delete
    const publicIds: string[] = Array.isArray(blog.publicIds)
      ? blog.publicIds
      : [];
    await this.assetsMaintenance.cleanupEntityAssets(publicIds);

    await this.blogRepository.deleteBlog(id);
  }

  async getBlogCategories(): Promise<BlogCategoryResponseDto[]> {
    return this.blogRepository.findAllCategories();
  }

  async createBlogCategory(
    createBlogCategoryDto: CreateBlogCategoryDto,
  ): Promise<BlogCategoryResponseDto> {
    return this.blogRepository.createCategory(createBlogCategoryDto);
  }

  async getBlogCategoryById(id: string): Promise<BlogCategoryResponseDto> {
    const category = await this.blogRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError('Blog category not found');
    }
    return category;
  }

  async updateBlogCategory(
    id: string,
    updateBlogCategoryDto: UpdateBlogCategoryDto,
  ): Promise<BlogCategoryResponseDto> {
    await this.getBlogCategoryById(id);
    return this.blogRepository.updateCategory(id, updateBlogCategoryDto);
  }

  async deleteBlogCategory(id: string): Promise<void> {
    await this.getBlogCategoryById(id);

    // Check if category has blogs
    const blogsCount = await this.blogRepository.countBlogsByCategory(id);
    if (blogsCount > 0) {
      throw new ConflictError('Cannot delete category that has blogs');
    }

    await this.blogRepository.deleteCategory(id);
  }
}
