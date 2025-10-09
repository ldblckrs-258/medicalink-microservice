import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuestionResponseDto, AnswerResponseDto } from '@app/contracts';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuestion(data: {
    title: string;
    content: string;
    authorId: string;
  }): Promise<QuestionResponseDto> {
    const question = await this.prisma.question.create({
      data: {
        title: data.title,
        body: data.content,
        authorEmail: data.authorId,
        status: 'PENDING',
      },
    });

    return this.transformQuestionResponse(question);
  }

  async findAllQuestions(params: {
    page: number;
    limit: number;
    authorId?: string;
    status?: string;
  }) {
    const { page, limit, authorId, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (authorId) where.authorEmail = authorId;
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

    return {
      data: questions.map((question) =>
        this.transformQuestionResponse(question),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateQuestion(
    id: string,
    data: {
      title?: string;
      content?: string;
    },
  ): Promise<QuestionResponseDto> {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.body = data.content;

    const question = await this.prisma.question.update({
      where: { id },
      data: updateData,
    });

    return this.transformQuestionResponse(question);
  }

  async findQuestionById(id: string): Promise<QuestionResponseDto | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    return question ? this.transformQuestionResponse(question) : null;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.prisma.question.delete({
      where: { id },
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
        status: status as any, // Cast to any to avoid type issues with QuestionStatus enum
      },
    });
  }

  async createAnswer(data: {
    body: string;
    questionId: string;
    doctorId: string;
  }): Promise<AnswerResponseDto> {
    const answer = await this.prisma.answer.create({
      data: {
        ...data,
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
      // Unaccept all other answers for this question
      this.prisma.answer.updateMany({
        where: { questionId: answer.questionId },
        data: { isAccepted: false },
      }),
      // Accept this answer
      this.prisma.answer.update({
        where: { id },
        data: { isAccepted: true },
      }),
      // Mark question as answered
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

  private transformQuestionResponse(question: any): QuestionResponseDto {
    return {
      id: question.id,
      title: question.title,
      content: question.body || question.content, // Support both field names
      authorId: question.authorId || question.authorEmail || '',
      categoryId: question.categoryId,
      category: question.category
        ? {
            id: question.category.id,
            name: question.category.name,
            description: question.category.description,
          }
        : undefined,
      tags: question.tags,
      isAnswered: question.status === 'ANSWERED', // Derive from status
      status: question.status,
      viewCount: 0, // Default value since field doesn't exist in schema
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  private transformAnswerResponse(answer: any): AnswerResponseDto {
    return {
      id: answer.id,
      content: answer.content,
      questionId: answer.questionId,
      authorId: answer.authorId,
      isAccepted: answer.isAccepted,
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }
}
