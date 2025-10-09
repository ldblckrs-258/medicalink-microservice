import { Injectable } from '@nestjs/common';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '@app/domain-errors';
import { PaginatedResponse } from '@app/contracts';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewResponseDto,
} from '@app/contracts';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async createReview(
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Check if user already reviewed this doctor
    if (createReviewDto.authorEmail) {
      const existingReview = await this.reviewRepository.findExistingReview(
        createReviewDto.authorEmail,
        createReviewDto.doctorId,
      );

      if (existingReview) {
        throw new ConflictError('You have already reviewed this doctor');
      }
    }

    return this.reviewRepository.createReview(createReviewDto);
  }

  async getReviews(params: {
    page: number;
    limit: number;
    doctorId?: string;
    userId?: string;
  }): Promise<PaginatedResponse<ReviewResponseDto>> {
    const result = await this.reviewRepository.findAllReviews(params);

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    };
  }

  async getReviewsByDoctor(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<ReviewResponseDto>> {
    const result = await this.reviewRepository.findReviewsByDoctorId({
      doctorId,
      page,
      limit,
    });

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
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

  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    authorEmail: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.getReviewById(id);

    if (review.authorEmail !== authorEmail) {
      throw new ForbiddenError('You can only update your own reviews');
    }

    return this.reviewRepository.updateReview(id, updateReviewDto);
  }

  async deleteReview(
    id: string,
    authorEmail: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const review = await this.getReviewById(id);

    if (!isAdmin && review.authorEmail !== authorEmail) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await this.reviewRepository.deleteReview(id);
  }

  async getDoctorReviewStats(doctorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    return this.reviewRepository.getReviewStats(doctorId);
  }
}
