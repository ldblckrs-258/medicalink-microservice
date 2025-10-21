import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  Public,
  RequirePermission,
  RequireReadPermission,
  RequireUpdatePermission,
  RequireDeletePermission,
  CurrentUser,
  type JwtPayloadDto,
} from '@app/contracts';
import {
  CreateBlogDto,
  UpdateBlogDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from '@app/contracts';
import { BlogPublicQueryDto, BlogQueryDto } from '@app/contracts/dtos/content';
import { MicroserviceService } from '../utils/microservice.service';
import { DeleteBlogCategoryQueryDto } from '@app/contracts/dtos/content/delete-blog-category-query.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Public - list categories
  @Public()
  @Get('categories')
  async listCategories(@Query() query: any) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_blog_categories',
      query,
    );
  }

  // Public - get category by id
  @Public()
  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_blog_category_by_id',
      { id },
    );
  }

  // Admin - create category
  @RequirePermission('blogs', 'manage')
  @Post('categories')
  async createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'create_blog_category',
      dto,
    );
  }

  // Admin - update category
  @RequirePermission('blogs', 'manage')
  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateBlogCategoryDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'update_blog_category',
      { id, data: dto },
    );
  }

  // Admin - delete category
  @RequirePermission('blogs', 'manage')
  @Delete('categories/:id')
  async deleteCategory(
    @Param('id') id: string,
    @Query() query: DeleteBlogCategoryQueryDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'delete_blog_category',
      { id, forceBulkDelete: query.forceBulkDelete },
    );
  }

  // Public - list published blogs (minimal fields)
  @Public()
  @Get('public')
  async findPublic(@Query() query: BlogPublicQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_blogs',
      { ...query, status: 'PUBLISHED' },
    );
  }

  // Public - get blog by id (published only)
  @Public()
  @Get('/public/:slug')
  async findOnePublic(@Param('slug') slug: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_published_blog',
      { slug },
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_blog_by_id',
      { id },
    );
  }

  // Doctor - create blog
  @RequirePermission('blogs', 'create')
  @Post()
  async create(@Body() dto: CreateBlogDto, @CurrentUser() user: JwtPayloadDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'create_blog',
      { ...dto, authorId: user.sub },
    );
  }

  // Admin - list all blogs (manager view)
  @RequireReadPermission('blogs')
  @Get()
  async findAllManager(@Query() query: BlogQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_blogs',
      query,
    );
  }

  // Admin - update blog
  @RequireUpdatePermission('blogs')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'update_blog',
      { id, data: dto },
    );
  }

  // Admin - delete blog
  @RequireDeletePermission('blogs')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'delete_blog',
      { id },
    );
  }
}
