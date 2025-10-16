import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogsService } from './blogs.service';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from '@app/contracts';
import { BlogQueryDto } from '@app/contracts';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @MessagePattern('create_blog')
  async createBlog(@Payload() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  @MessagePattern('get_blogs')
  async getBlogs(@Payload() query: BlogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return this.blogsService.getBlogs({ ...query, page, limit });
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
      data: UpdateBlogDto;
    },
  ) {
    const { id, data } = payload;
    return this.blogsService.updateBlog(id, data);
  }

  @MessagePattern('delete_blog')
  async deleteBlog(@Payload() payload: { id: string }) {
    const { id } = payload;
    return this.blogsService.deleteBlog(id);
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
      data: UpdateBlogCategoryDto;
    },
  ) {
    const { id, data } = payload;
    return this.blogsService.updateBlogCategory(id, data);
  }

  @MessagePattern('delete_blog_category')
  async deleteBlogCategory(
    @Payload() payload: { id: string; forceBulkDelete?: boolean },
  ) {
    return this.blogsService.deleteBlogCategory(
      payload.id,
      payload.forceBulkDelete === true,
    );
  }
}
