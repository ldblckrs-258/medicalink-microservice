import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public, RequireDeletePermission } from '@app/contracts';
import { CreateReviewDto } from '@app/contracts';
import { GetReviewsQueryDto } from '@app/contracts/dtos/content';
import { MicroserviceService } from '../utils/microservice.service';
import { PublicCreateThrottle } from '../utils/custom-throttle.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Public - create review
  @Public()
  @PublicCreateThrottle()
  @Post()
  async create(@Body() dto: CreateReviewDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'create_review',
      dto,
    );
  }

  // Public - list reviews
  @Public()
  @Get()
  async findAll(@Query() query: GetReviewsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_reviews',
      query,
    );
  }

  // Public - list reviews by doctor
  @Public()
  @Get('doctors/:doctorId')
  async getByDoctor(
    @Param('doctorId') doctorId: string,
    @Query() query: GetReviewsQueryDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_reviews_by_doctor',
      { doctorId, ...query },
    );
  }

  // Public - get review by id
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_review_by_id',
      { id },
    );
  }

  // Admin - delete review
  @RequireDeletePermission('reviews')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'delete_review',
      { id },
    );
  }
}
