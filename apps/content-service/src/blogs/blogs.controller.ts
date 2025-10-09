import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogsService } from './blogs.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from '@app/contracts';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @MessagePattern('create_blog')
  async createBlog(@Payload() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  @MessagePattern('get_blogs')
  async getBlogs(
    @Payload() payload: { page?: number; limit?: number; categoryId?: string },
  ) {
    const { page = 1, limit = 10, categoryId } = payload;
    return this.blogsService.getBlogs({ page, limit, categoryId });
  }

  @MessagePattern('get_blog_by_id')
  async getBlogById(@Payload() payload: { id: string }) {
    return this.blogsService.getBlogById(payload.id);
  }

  @MessagePattern('update_blog')
  async updateBlog(
    @Payload()
    payload: {
      id: string;
      updateBlogDto: UpdateBlogDto;
      authorId: string;
      isAdmin?: boolean;
    },
  ) {
    const { id, updateBlogDto, authorId, isAdmin = false } = payload;
    return this.blogsService.updateBlog(id, updateBlogDto, authorId, isAdmin);
  }

  @MessagePattern('delete_blog')
  async deleteBlog(
    @Payload() payload: { id: string; authorId: string; isAdmin?: boolean },
  ) {
    const { id, authorId, isAdmin = false } = payload;
    return this.blogsService.deleteBlog(id, authorId, isAdmin);
  }

  @MessagePattern('get_blog_categories')
  async getBlogCategories() {
    return this.blogsService.getBlogCategories();
  }

  @MessagePattern('create_blog_category')
  async createBlogCategory(
    @Payload() createBlogCategoryDto: CreateBlogCategoryDto,
  ) {
    return this.blogsService.createBlogCategory(createBlogCategoryDto);
  }

  @MessagePattern('get_blog_category_by_id')
  async getBlogCategoryById(@Payload() payload: { id: string }) {
    return this.blogsService.getBlogCategoryById(payload.id);
  }

  @MessagePattern('update_blog_category')
  async updateBlogCategory(
    @Payload()
    payload: {
      id: string;
      updateBlogCategoryDto: UpdateBlogCategoryDto;
    },
  ) {
    const { id, updateBlogCategoryDto } = payload;
    return this.blogsService.updateBlogCategory(id, updateBlogCategoryDto);
  }

  @MessagePattern('delete_blog_category')
  async deleteBlogCategory(@Payload() payload: { id: string }) {
    return this.blogsService.deleteBlogCategory(payload.id);
  }
}
