import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateAnswerDto,
} from '@app/contracts';
import { QUESTIONS_PATTERNS, ANSWERS_PATTERNS } from '@app/contracts/patterns';

@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @MessagePattern(QUESTIONS_PATTERNS.CREATE)
  create(@Payload() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createQuestionDto);
  }

  @MessagePattern(QUESTIONS_PATTERNS.GET_LIST)
  findAll(@Payload() data: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = data || {};
    return this.questionsService.getQuestions({ page, limit });
  }

  @MessagePattern(QUESTIONS_PATTERNS.GET_BY_ID)
  findOne(@Payload() data: { id: string }) {
    return this.questionsService.getQuestionById(data.id);
  }

  @MessagePattern(QUESTIONS_PATTERNS.UPDATE)
  update(
    @Payload()
    data: {
      id: string;
      updateQuestionDto: UpdateQuestionDto;
      authorEmail: string;
      isAdmin?: boolean;
    },
  ) {
    return this.questionsService.updateQuestion(
      data.id,
      data.updateQuestionDto,
      data.authorEmail,
      data.isAdmin,
    );
  }

  @MessagePattern(QUESTIONS_PATTERNS.DELETE)
  remove(
    @Payload() data: { id: string; authorEmail: string; isAdmin?: boolean },
  ) {
    return this.questionsService.deleteQuestion(
      data.id,
      data.authorEmail,
      data.isAdmin,
    );
  }

  @MessagePattern(ANSWERS_PATTERNS.CREATE)
  createAnswer(@Payload() createAnswerDto: CreateAnswerDto) {
    return this.questionsService.createAnswer(createAnswerDto);
  }

  @MessagePattern(ANSWERS_PATTERNS.GET_LIST)
  getAnswers(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      questionId?: string;
      authorId?: string;
    },
  ) {
    const { page = 1, limit = 10, questionId, authorId } = data || {};
    return this.questionsService.getAnswers({
      page,
      limit,
      questionId,
      authorId,
    });
  }

  @MessagePattern(ANSWERS_PATTERNS.GET_BY_ID)
  getAnswerById(@Payload() data: { id: string }) {
    return this.questionsService.getAnswerById(data.id);
  }

  @MessagePattern(ANSWERS_PATTERNS.UPDATE)
  updateAnswer(
    @Payload()
    data: {
      id: string;
      updateAnswerDto: UpdateAnswerDto;
      authorId: string;
    },
  ) {
    return this.questionsService.updateAnswer(
      data.id,
      data.updateAnswerDto,
      data.authorId,
    );
  }

  @MessagePattern(ANSWERS_PATTERNS.DELETE)
  deleteAnswer(
    @Payload() data: { id: string; authorId: string; isAdmin?: boolean },
  ) {
    return this.questionsService.deleteAnswer(
      data.id,
      data.authorId,
      data.isAdmin,
    );
  }
}
