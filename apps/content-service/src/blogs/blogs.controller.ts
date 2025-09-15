import { Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { BlogsService } from './blogs.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  async createBlog() {
    return this.blogsService.createBlog();
  }

  @Get()
  async getBlogs() {
    return this.blogsService.getBlogs();
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return this.blogsService.getBlogById(id);
  }

  @Put(':id')
  async updateBlog(@Param('id') _id: string) {
    return this.blogsService.updateBlog();
  }

  @Delete(':id')
  async deleteBlog(@Param('id') _id: string) {
    return this.blogsService.deleteBlog();
  }

  @Get('categories')
  async getBlogCategories() {
    return this.blogsService.getBlogCategories();
  }

  @Post('categories')
  async createBlogCategory() {
    return this.blogsService.createBlogCategory();
  }
}
