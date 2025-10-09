import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { ReviewResponseDto } from '@app/contracts';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: {
    rating: number;
    title?: string;
    body?: string;
    authorName?: string;
    authorEmail?: string;
    doctorId: string;
  }): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.create({
      data: {
        id: createId(),
        ...data,
      },
    });

    return this.transformReviewResponse(review);
  }

  async findAllReviews(params: {
    page: number;
    limit: number;
    doctorId?: string;
    authorEmail?: string;
  }) {
    const { page, limit, doctorId, authorEmail } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (authorEmail) where.authorEmail = authorEmail;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews.map((review) => this.transformReviewResponse(review)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findReviewsByDoctorId(params: {
    doctorId: string;
    page: number;
    limit: number;
  }) {
    const { doctorId, page, limit } = params;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { doctorId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.review.count({ where: { doctorId } }),
    ]);

    return {
      data: reviews.map((review) => this.transformReviewResponse(review)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findReviewById(id: string): Promise<ReviewResponseDto | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    return review ? this.transformReviewResponse(review) : null;
  }

  async updateReview(
    id: string,
    data: {
      rating?: number;
      comment?: string;
    },
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.update({
      where: { id },
      data,
    });

    return this.transformReviewResponse(review);
  }

  async deleteReview(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    });
  }

  async findExistingReview(
    authorEmail: string,
    doctorId: string,
  ): Promise<ReviewResponseDto | null> {
    const review = await this.prisma.review.findFirst({
      where: {
        authorEmail,
        doctorId,
      },
    });

    return review ? this.transformReviewResponse(review) : null;
  }

  async getAverageRating(doctorId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { doctorId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  async getReviewStats(doctorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const [avgResult, totalReviews, distribution] = await Promise.all([
      this.prisma.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
      }),
      this.prisma.review.count({ where: { doctorId } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { doctorId },
        _count: { rating: true },
        orderBy: { rating: 'asc' },
      }),
    ]);

    return {
      averageRating: avgResult._avg.rating || 0,
      totalReviews,
      ratingDistribution: distribution.map((item) => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }

  private transformReviewResponse(review: any): ReviewResponseDto {
    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      authorName: review.authorName,
      authorEmail: review.authorEmail,
      doctorId: review.doctorId,
      isPublic: review.isPublic,
      createdAt: review.createdAt,
    };
  }
}
