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
import { PaginationDto, Public, RequireDeletePermission } from '@app/contracts';
import { CreateReviewDto, REVIEWS_PATTERNS } from '@app/contracts';
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
      REVIEWS_PATTERNS.CREATE,
      dto,
    );
  }

  // Public - list reviews by doctor
  @Public()
  @Get('/doctor/:doctorId')
  async getByDoctor(
    @Param('doctorId') doctorId: string,
    @Query() query: PaginationDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      REVIEWS_PATTERNS.GET_BY_DOCTOR,
      { doctorId, ...query },
    );
  }

  // Public - get review by id
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      REVIEWS_PATTERNS.GET_BY_ID,
      { id },
    );
  }

  // Admin - delete review
  @RequireDeletePermission('reviews')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      REVIEWS_PATTERNS.DELETE,
      { id },
    );
  }
}
