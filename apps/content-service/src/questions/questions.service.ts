import { Injectable } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionResponseDto,
  CreateAnswerDto,
  AnswerResponseDto,
  UpdateAnswerDto,
  GetQuestionsQueryDto,
} from '@app/contracts/dtos/content';
import { AssetsMaintenanceService } from '../assets/assets-maintenance.service';
import { NotFoundError } from '@app/domain-errors';
import { QuestionStatus } from 'apps/content-service/prisma/generated/client';
import { SCreateAnswerDto } from './dtos/s-create-answer-dto';

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

  async getQuestions(params: GetQuestionsQueryDto) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const result = await this.questionRepository.findAllQuestions({
      ...params,
      page,
      limit,
    });
    const hasNext = page * limit < result.total;
    const hasPrev = page > 1;
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
  ): Promise<QuestionResponseDto> {
    // Kiểm tra question có tồn tại không
    await this.getQuestionById(id);

    return this.questionRepository.updateQuestion(id, updateQuestionDto);
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = await this.getQuestionById(id);

    // Cleanup assets
    const publicIds: string[] = Array.isArray(question.publicIds)
      ? question.publicIds
      : [];
    await this.assetsMaintenance.cleanupEntityAssets(publicIds);

    await this.questionRepository.deleteQuestion(id);
  }

  async createAnswer(
    createAnswerDto: SCreateAnswerDto,
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
    isAccepted?: boolean;
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
  ): Promise<AnswerResponseDto> {
    const existing = await this.questionRepository.findAnswerById(id);
    if (!existing) {
      throw new NotFoundError('Answer not found');
    }
    return this.questionRepository.updateAnswer(id, updateAnswerDto);
  }

  async deleteAnswer(id: string): Promise<void> {
    const existing = await this.questionRepository.findAnswerById(id);
    if (!existing) {
      throw new NotFoundError('Answer not found');
    }
    await this.questionRepository.deleteAnswer(id);
  }
}
