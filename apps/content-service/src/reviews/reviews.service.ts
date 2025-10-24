import { Injectable } from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto, ReviewResponseDto } from '@app/contracts';
import { AssetsMaintenanceService } from '../assets/assets-maintenance.service';
import { NotFoundError } from '@app/domain-errors';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly assetsMaintenance: AssetsMaintenanceService,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewRepository.createReview(createReviewDto);
  }

  async getReviews(params: { page: number; limit: number }) {
    const result = await this.reviewRepository.findAllReviews(params);
    const hasNext = params.page * params.limit < result.total;
    const hasPrev = params.page > 1;
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

  async getReviewsByDoctor(params: {
    page: number;
    limit: number;
    doctorId: string;
  }) {
    const result = await this.reviewRepository.findReviewsByDoctorId(params);
    const hasNext = params.page * params.limit < result.total;
    const hasPrev = params.page > 1;
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

  async getReviewById(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findReviewById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }
    return review;
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.getReviewById(id);

    // Cleanup assets
    const publicIds: string[] = Array.isArray(review.publicIds)
      ? review.publicIds
      : [];
    await this.assetsMaintenance.cleanupEntityAssets(publicIds);

    await this.reviewRepository.deleteReview(id);
  }
}
