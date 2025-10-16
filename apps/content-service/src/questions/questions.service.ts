import { Injectable } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionResponseDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  AnswerResponseDto,
} from '@app/contracts';
import { AssetsMaintenanceService } from '../assets/assets-maintenance.service';
import { NotFoundError, ForbiddenError } from '@app/domain-errors';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly assetsMaintenance: AssetsMaintenanceService,
  ) {}

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    return this.questionRepository.createQuestion(createQuestionDto);
  }

  async getQuestions(params: { page: number; limit: number }) {
    const result = await this.questionRepository.findAllQuestions(params);
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

  async getQuestionById(id: string): Promise<QuestionResponseDto> {
    const question = await this.questionRepository.findQuestionById(id);
    if (!question) {
      throw new NotFoundError('Question not found');
    }
    return question;
  }

  async updateQuestion(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
    authorEmail: string,
    isAdmin: boolean = false,
  ): Promise<QuestionResponseDto> {
    const question = await this.getQuestionById(id);

    if (!isAdmin && question.authorEmail !== authorEmail) {
      throw new ForbiddenError('You can only update your own questions');
    }

    // Reconcile assets
    const prevPublicIds: string[] = Array.isArray(question.publicIds)
      ? question.publicIds
      : [];
    const nextPublicIds: string[] = Array.isArray(updateQuestionDto.publicIds)
      ? updateQuestionDto.publicIds
      : prevPublicIds;
    await this.assetsMaintenance.reconcileEntityAssets(
      prevPublicIds,
      nextPublicIds,
    );

    return this.questionRepository.updateQuestion(id, updateQuestionDto);
  }

  async deleteQuestion(
    id: string,
    authorEmail: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const question = await this.getQuestionById(id);

    if (!isAdmin && question.authorEmail !== authorEmail) {
      throw new ForbiddenError('You can only delete your own questions');
    }

    // Cleanup assets
    const publicIds: string[] = Array.isArray(question.publicIds)
      ? question.publicIds
      : [];
    await this.assetsMaintenance.cleanupEntityAssets(publicIds);

    await this.questionRepository.deleteQuestion(id);
  }

  async createAnswer(
    createAnswerDto: CreateAnswerDto,
  ): Promise<AnswerResponseDto> {
    const data = {
      body: createAnswerDto.body,
      questionId: createAnswerDto.questionId,
      authorId: createAnswerDto.authorId,
    };
    return this.questionRepository.createAnswer(data);
  }

  async getAnswers(params: {
    page: number;
    limit: number;
    questionId?: string;
    authorId?: string;
  }) {
    const result = await this.questionRepository.findAllAnswers(params);
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
    const existing = await this.questionRepository.findAnswerById(id);
    if (!existing) {
      throw new NotFoundError('Answer not found');
    }
    if (existing.authorId !== authorId) {
      throw new ForbiddenError('You can only update your own answers');
    }
    return this.questionRepository.updateAnswer(id, {
      body: updateAnswerDto.body,
    });
  }

  async deleteAnswer(
    id: string,
    authorId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const existing = await this.questionRepository.findAnswerById(id);
    if (!existing) {
      throw new NotFoundError('Answer not found');
    }
    if (!isAdmin && existing.authorId !== authorId) {
      throw new ForbiddenError('You can only delete your own answers');
    }
    await this.questionRepository.deleteAnswer(id);
  }
}
