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
import {
  BLOGS_PATTERNS,
  BLOG_CATEGORIES_PATTERNS,
} from '@app/contracts/patterns';

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
      BLOG_CATEGORIES_PATTERNS.GET_LIST,
      query,
    );
  }

  // Public - get category by id
  @Public()
  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOG_CATEGORIES_PATTERNS.GET_BY_ID,
      { id },
    );
  }

  // Admin - create category
  @RequirePermission('blogs', 'manage')
  @Post('categories')
  async createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOG_CATEGORIES_PATTERNS.CREATE,
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
      BLOG_CATEGORIES_PATTERNS.UPDATE,
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
      BLOG_CATEGORIES_PATTERNS.DELETE,
      { id, forceBulkDelete: query.forceBulkDelete },
    );
  }

  // Public - list published blogs (minimal fields)
  @Public()
  @Get('public')
  async findPublic(@Query() query: BlogPublicQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.GET_LIST,
      { ...query, status: 'PUBLISHED' },
    );
  }

  // Public - get blog by slug (published only)
  @Public()
  @Get('/public/:slug')
  async findOnePublic(@Param('slug') slug: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.GET_PUBLISHED,
      { slug },
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.GET_BY_ID,
      { id },
    );
  }

  // Doctor - create blog
  @RequirePermission('blogs', 'create')
  @Post()
  async create(@Body() dto: CreateBlogDto, @CurrentUser() user: JwtPayloadDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.CREATE,
      { ...dto, authorId: user.sub },
    );
  }

  // Admin - list all blogs (manager view)
  @RequireReadPermission('blogs')
  @Get()
  async findAllManager(@Query() query: BlogQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.GET_LIST,
      query,
    );
  }

  // Admin - update blog
  @RequireUpdatePermission('blogs')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.UPDATE,
      { id, data: dto },
    );
  }

  // Admin - delete blog
  @RequireDeletePermission('blogs')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      BLOGS_PATTERNS.DELETE,
      { id },
    );
  }
}
