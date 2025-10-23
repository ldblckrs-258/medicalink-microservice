import { Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  BlogResponseDto,
  BlogCategoryResponseDto,
  BlogQueryDto,
} from '@app/contracts';
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
} from '@app/domain-errors';
import { AssetsMaintenanceService } from '../assets/assets-maintenance.service';
import {
  createPlaceholderImageUrl,
  FontOptions,
  IMAGE_PLACEHOLDER_DEFAULT_OPTIONS,
} from '@app/commons/utils';
import { shortenText } from '@app/commons/utils/sorten-text';

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

    if (!createBlogDto.authorId) {
      throw new UnauthorizedError('You are not authorized to create a blog');
    }

    if (createBlogDto.categoryId) {
      const category = await this.blogRepository.findCategoryById(
        createBlogDto.categoryId,
      );
      if (!category) {
        throw new NotFoundError('Blog category not found');
      }
    }

    const thumbnailUrl =
      createBlogDto.thumbnailUrl ||
      createPlaceholderImageUrl({
        ...IMAGE_PLACEHOLDER_DEFAULT_OPTIONS,
        text: shortenText(createBlogDto.title, 30),
      });

    return this.blogRepository.createBlog({
      title: createBlogDto.title,
      content: createBlogDto.content,
      authorId: createBlogDto.authorId,
      categoryId: createBlogDto.categoryId,
      thumbnailUrl: thumbnailUrl,
      publicIds: createBlogDto.publicIds,
    });
  }

  async getBlogs(params: BlogQueryDto & { authorId?: string }) {
    const result = await this.blogRepository.findAllBlogs(params);
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const hasNext = page * limit < result.total;
    const hasPrev = page > 1;
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

  async getPublishedBlog(slug: string): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findPublishedBlog(slug);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }
    return blog;
  }

  async updateBlog(id: string, data: UpdateBlogDto): Promise<BlogResponseDto> {
    const blog = await this.getBlogById(id);

    if (data.categoryId) {
      const category = await this.blogRepository.findCategoryById(
        data.categoryId,
      );
      if (!category) {
        throw new NotFoundError('Blog category not found');
      }
    }

    // Reconcile assets
    const prevPublicIds: string[] = Array.isArray(blog.publicIds)
      ? blog.publicIds
      : [];
    const nextPublicIds: string[] = Array.isArray(data.publicIds)
      ? data.publicIds
      : prevPublicIds;
    await this.assetsMaintenance.reconcileEntityAssets(
      prevPublicIds,
      nextPublicIds,
    );

    return this.blogRepository.updateBlog(id, data);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.getBlogById(id);

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
    data: UpdateBlogCategoryDto,
  ): Promise<BlogCategoryResponseDto> {
    await this.getBlogCategoryById(id);
    return this.blogRepository.updateCategory(id, data);
  }

  async deleteBlogCategory(
    id: string,
    forceBulkDelete: boolean = false,
  ): Promise<void> {
    await this.getBlogCategoryById(id);

    if (forceBulkDelete) {
      await this.blogRepository.bulkDeleteBlogsByCategory(id);
      await this.blogRepository.deleteCategory(id);
      return;
    }

    const blogsCount = await this.blogRepository.countBlogsByCategory(id);
    if (blogsCount > 0) {
      throw new ConflictError('Cannot delete category that has blogs');
    }

    await this.blogRepository.deleteCategory(id);
  }
}
