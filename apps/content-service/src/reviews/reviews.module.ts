import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewRepository } from './review.repository';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewRepository],
  exports: [ReviewsService, ReviewRepository],
})
export class ReviewsModule {}
