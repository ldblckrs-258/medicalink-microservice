import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '@app/contracts';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @MessagePattern('create_review')
  async createReview(@Payload() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(createReviewDto);
  }

  @MessagePattern('get_reviews')
  async getReviews(@Payload() payload: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = payload;
    return this.reviewsService.getReviews({ page, limit });
  }

  @MessagePattern('get_reviews_by_doctor')
  async getReviewsByDoctor(
    @Payload() payload: { doctorId: string; page?: number; limit?: number },
  ) {
    const { doctorId, page = 1, limit = 10 } = payload;
    return this.reviewsService.getReviewsByDoctor(doctorId, page, limit);
  }

  @MessagePattern('get_review_by_id')
  async getReviewById(@Payload() payload: { id: string }) {
    return this.reviewsService.getReviewById(payload.id);
  }

  @MessagePattern('update_review')
  async updateReview(
    @Payload()
    payload: {
      id: string;
      updateReviewDto: UpdateReviewDto;
      userId: string;
    },
  ) {
    const { id, updateReviewDto, userId } = payload;
    return this.reviewsService.updateReview(id, updateReviewDto, userId);
  }

  @MessagePattern('delete_review')
  async deleteReview(
    @Payload() payload: { id: string; userId: string; isAdmin?: boolean },
  ) {
    const { id, userId, isAdmin = false } = payload;
    return this.reviewsService.deleteReview(id, userId, isAdmin);
  }
}
