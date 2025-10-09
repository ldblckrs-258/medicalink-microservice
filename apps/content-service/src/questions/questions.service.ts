import { Injectable } from '@nestjs/common';
import { NotFoundError, ForbiddenError } from '@app/domain-errors';
import { PaginatedResponse } from '@app/contracts';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionResponseDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  AnswerResponseDto,
} from '@app/contracts';
import { QuestionRepository } from './question.repository';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const data: {
      title: string;
      content: string;
      authorId: string;
      categoryId?: string;
      tags?: string[];
    } = {
      title: String((createQuestionDto as any).title),
      content: String(
        (createQuestionDto as any).content ??
          (createQuestionDto as any).body ??
          '',
      ),
      authorId: String(
        (createQuestionDto as any).authorId ??
          (createQuestionDto as any).authorEmail ??
          '',
      ),
      categoryId: (createQuestionDto as any).categoryId as string | undefined,
      tags: (createQuestionDto as any).tags as string[] | undefined,
    };

    return this.questionRepository.createQuestion(data);
  }

  async getQuestions(params: {
    page: number;
    limit: number;
    categoryId?: string;
    authorId?: string;
    isAnswered?: boolean;
  }): Promise<PaginatedResponse<QuestionResponseDto>> {
    const result = await this.questionRepository.findAllQuestions(params);

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

  async getQuestionById(id: string): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findQuestionById(id);
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    // Increment view count
    await this.questionRepository.incrementViewCount(id);

    return question;
  }

  async updateQuestion(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    userId: string,
  ): Promise<QuestionResponseDto> {
    const question = await this.getQuestionById(id);

    if (question.authorId !== userId) {
      throw new ForbiddenError('You can only update your own questions');
    }

    const data: {
      title?: string;
      content?: string;
      categoryId?: string;
      tags?: string[];
    } = {
      title: (updateQuestionDto as any).title as string | undefined,
      content: ((updateQuestionDto as any).content ??
        (updateQuestionDto as any).body) as string | undefined,
      categoryId: (updateQuestionDto as any).categoryId as string | undefined,
      tags: (updateQuestionDto as any).tags as string[] | undefined,
    };

    return this.questionRepository.updateQuestion(id, data);
  }

  async deleteQuestion(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const question = await this.getQuestionById(id);

    if (!isAdmin && question.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own questions');
    }

    await this.questionRepository.deleteQuestion(String(id));
  }

  async createAnswer(
    createAnswerDto: CreateAnswerDto,
  ): Promise<AnswerResponseDto> {
    // Check if question exists
    const question = await this.questionRepository.findQuestionById(
      String((createAnswerDto as any).questionId),
    );
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    const data: {
      body: string;
      questionId: string;
      doctorId: string;
    } = {
      body: String((createAnswerDto as any).body),
      questionId: String((createAnswerDto as any).questionId),
      doctorId: String((createAnswerDto as any).doctorId),
    };

    const answer = await this.questionRepository.createAnswer(data);

    // Update question answered status
    await this.questionRepository.updateAnsweredStatus(
      data.questionId,
      'ANSWERED',
    );

    return answer;
  }

  async getAnswers(params: {
    page: number;
    limit: number;
    questionId?: string;
    authorId?: string;
  }): Promise<PaginatedResponse<AnswerResponseDto>> {
    const result = await this.questionRepository.findAllAnswers(params);

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

  async getAnswerById(id: string): Promise<AnswerResponseDto> {
    const answer = await this.questionRepository.findAnswerById(id);
    if (!answer) {
      throw new NotFoundError('Answer not found');
    }
    return answer;
  }

  async updateAnswer(
    id: string,
    updateAnswerDto: UpdateAnswerDto,
    authorId: string,
  ): Promise<AnswerResponseDto> {
    const answer = await this.getAnswerById(id);

    if (answer.authorId !== authorId) {
      throw new ForbiddenError('You can only update your own answers');
    }

    const data = {
      body: (updateAnswerDto as any).body as string | undefined,
    };

    return this.questionRepository.updateAnswer(id, data);
  }

  async deleteAnswer(
    id: string,
    authorId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const answer = await this.getAnswerById(id);

    if (!isAdmin && answer.authorId !== authorId) {
      throw new ForbiddenError('You can only delete your own answers');
    }

    await this.questionRepository.deleteAnswer(String(id));

    // Update question answered status after deleting answer
    await this.questionRepository.updateAnsweredStatus(
      String(answer.questionId),
      'PENDING',
    );
  }

  async acceptAnswer(
    answerId: string,
    questionAuthorId: string,
  ): Promise<void> {
    const answer = await this.getAnswerById(answerId);
    const question = await this.questionRepository.findQuestionById(
      String(answer.questionId),
    );

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    if (question.authorId !== questionAuthorId) {
      throw new ForbiddenError('Only question author can accept answers');
    }

    return this.questionRepository.acceptAnswer(String(answerId));
  }
}
