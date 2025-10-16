import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  QuestionResponseDto,
  AnswerResponseDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from '@app/contracts';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuestion(data: CreateQuestionDto): Promise<QuestionResponseDto> {
    const question = await this.prisma.question.create({
      data: {
        title: data.title,
        body: data.body,
        authorName: data.authorName ?? undefined,
        authorEmail: data.authorEmail ?? undefined,
        specialtyId: data.specialtyId ?? undefined,
        status: 'PENDING',
      },
    });

    // Persist assets if provided
    if (Array.isArray((data as any).publicIds)) {
      await this.setEntityAssets(
        'QUESTION',
        question.id,
        (data as any).publicIds as string[],
      );
    }
    const publicIds = await this.getPublicIdsForEntity('QUESTION', question.id);

    return this.transformQuestionResponse(question, publicIds);
  }

  async findAllQuestions(params: {
    page: number;
    limit: number;
    authorEmail?: string;
    status?: string;
  }) {
    const { page, limit, authorEmail, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (authorEmail) where.authorEmail = authorEmail;
    if (status) where.status = status;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    const dataWithAssets = await Promise.all(
      questions.map(async (question) => ({
        question,
        publicIds: await this.getPublicIdsForEntity('QUESTION', question.id),
      })),
    );

    return {
      data: dataWithAssets.map(({ question, publicIds }) =>
        this.transformQuestionResponse(question, publicIds),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateQuestion(
    id: string,
    data: UpdateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const updateData: any = {};
    if ((data as any).title) updateData.title = (data as any).title;
    if ((data as any).body) updateData.body = (data as any).body;
    if ((data as any).authorName !== undefined)
      updateData.authorName = (data as any).authorName ?? undefined;
    if ((data as any).authorEmail !== undefined)
      updateData.authorEmail = (data as any).authorEmail ?? undefined;
    if ((data as any).specialtyId !== undefined)
      updateData.specialtyId = (data as any).specialtyId ?? undefined;
    if ((data as any).status !== undefined)
      updateData.status = (data as any).status;

    const question = await this.prisma.question.update({
      where: { id },
      data: updateData,
    });

    if (Array.isArray((data as any).publicIds)) {
      await this.setEntityAssets(
        'QUESTION',
        question.id,
        (data as any).publicIds as string[],
      );
    }
    const publicIds = await this.getPublicIdsForEntity('QUESTION', question.id);

    return this.transformQuestionResponse(question, publicIds);
  }

  async findQuestionById(id: string): Promise<QuestionResponseDto | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) return null;
    const publicIds = await this.getPublicIdsForEntity('QUESTION', question.id);

    return this.transformQuestionResponse(question, publicIds);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.prisma.question.delete({
      where: { id },
    });
    await this.prisma.asset.deleteMany({
      where: { entityType: 'QUESTION', entityId: id },
    });
  }

  async incrementViewCount(_id: string): Promise<void> {
    // viewCount is not persistently tracked in schema; no operation performed
    await Promise.resolve();
  }

  async updateAnsweredStatus(id: string, status: string): Promise<void> {
    await this.prisma.question.update({
      where: { id },
      data: {
        status: status as any,
      },
    });
  }

  async createAnswer(data: {
    body: string;
    questionId: string;
    authorId: string;
  }): Promise<AnswerResponseDto> {
    const answer = await this.prisma.answer.create({
      data: {
        body: data.body,
        questionId: data.questionId,
        authorId: data.authorId,
        isAccepted: false,
      },
    });

    return this.transformAnswerResponse(answer);
  }

  async findAnswersByQuestionId(
    questionId: string,
  ): Promise<AnswerResponseDto[]> {
    const answers = await this.prisma.answer.findMany({
      where: { questionId },
      orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
    });

    return answers.map((answer) => this.transformAnswerResponse(answer));
  }

  async findAnswerById(id: string): Promise<AnswerResponseDto | null> {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
    });

    return answer ? this.transformAnswerResponse(answer) : null;
  }

  async findAllAnswers(params: {
    page: number;
    limit: number;
    questionId?: string;
    authorId?: string;
  }): Promise<{
    data: AnswerResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, questionId, authorId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (questionId) where.questionId = questionId;
    if (authorId) where.authorId = authorId;

    const [answers, total] = await Promise.all([
      this.prisma.answer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isAccepted: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.answer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: answers.map((answer) => this.transformAnswerResponse(answer)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateAnswer(
    id: string,
    data: {
      body?: string;
    },
  ): Promise<AnswerResponseDto> {
    const answer = await this.prisma.answer.update({
      where: { id },
      data,
    });

    return this.transformAnswerResponse(answer);
  }

  async deleteAnswer(id: string): Promise<void> {
    await this.prisma.answer.delete({
      where: { id },
    });
  }

  async acceptAnswer(id: string): Promise<void> {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
      select: { questionId: true },
    });

    if (!answer) return;

    await this.prisma.$transaction([
      this.prisma.answer.updateMany({
        where: { questionId: answer.questionId },
        data: { isAccepted: false },
      }),
      this.prisma.answer.update({
        where: { id },
        data: { isAccepted: true },
      }),
      this.prisma.question.update({
        where: { id: answer.questionId },
        data: { status: 'ANSWERED' },
      }),
    ]);
  }

  async countAnswersByQuestion(questionId: string): Promise<number> {
    return await this.prisma.answer.count({
      where: { questionId },
    });
  }

  private transformQuestionResponse(
    question: any,
    publicIds?: string[],
  ): QuestionResponseDto {
    return {
      id: question.id,
      title: question.title,
      body: question.body,
      authorName: question.authorName,
      authorEmail: question.authorEmail,
      specialtyId: question.specialtyId,
      publicIds,
      isAnswered: question.status === 'ANSWERED',
      status: question.status,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  private transformAnswerResponse(answer: any): AnswerResponseDto {
    return {
      id: answer.id,
      body: answer.body,
      authorId: answer.authorId,
      questionId: answer.questionId,
      isAccepted: answer.isAccepted,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }

  private async getPublicIdsForEntity(
    entityType: 'BLOG' | 'QUESTION' | 'REVIEW',
    entityId: string,
  ): Promise<string[]> {
    const assets = await this.prisma.asset.findMany({
      where: { entityType, entityId },
      select: { publicId: true },
      orderBy: { createdAt: 'asc' },
    });
    return assets.map((a) => a.publicId);
  }

  private async setEntityAssets(
    entityType: 'BLOG' | 'QUESTION' | 'REVIEW',
    entityId: string,
    publicIds: string[],
  ): Promise<void> {
    const desired = this.normalizePublicIds(publicIds);
    const existingAssets = await this.prisma.asset.findMany({
      where: { entityType, entityId },
      select: { publicId: true },
    });

    const existing = existingAssets.filter(
      (a) => typeof a.publicId === 'string',
    ) as Array<{ publicId: string }>;

    const existingSet = new Set(existing.map((a) => a.publicId));

    const toRemove = existing
      .filter((a) => !desired.includes(a.publicId))
      .map((a) => a.publicId);
    const toAdd = desired.filter((id) => !existingSet.has(id));

    if (toRemove.length > 0) {
      await this.prisma.asset.deleteMany({
        where: { publicId: { in: toRemove } },
      });
    }

    for (const publicId of toAdd) {
      await this.prisma.asset.upsert({
        where: { publicId },
        update: { entityType, entityId },
        create: { publicId, entityType, entityId },
      });
    }
  }

  private normalizePublicIds(publicIds?: string[] | null): string[] {
    const ids = (publicIds ?? []).filter(
      (id): id is string => typeof id === 'string' && id.trim().length > 0,
    );
    return Array.from(new Set<string>(ids));
  }
}
