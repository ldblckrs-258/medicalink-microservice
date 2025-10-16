import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateAnswerDto,
} from '@app/contracts';

@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @MessagePattern('create_question')
  create(@Payload() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.createQuestion(createQuestionDto);
  }

  @MessagePattern('get_questions')
  findAll(@Payload() data: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = data || {};
    return this.questionsService.getQuestions({ page, limit });
  }

  @MessagePattern('get_question_by_id')
  findOne(@Payload() data: { id: string }) {
    return this.questionsService.getQuestionById(data.id);
  }

  @MessagePattern('update_question')
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

  @MessagePattern('delete_question')
  remove(
    @Payload() data: { id: string; authorEmail: string; isAdmin?: boolean },
  ) {
    return this.questionsService.deleteQuestion(
      data.id,
      data.authorEmail,
      data.isAdmin,
    );
  }

  @MessagePattern('create_answer')
  createAnswer(@Payload() createAnswerDto: CreateAnswerDto) {
    return this.questionsService.createAnswer(createAnswerDto);
  }

  @MessagePattern('get_answers')
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

  @MessagePattern('get_answer_by_id')
  getAnswerById(@Payload() data: { id: string }) {
    return this.questionsService.getAnswerById(data.id);
  }

  @MessagePattern('update_answer')
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

  @MessagePattern('delete_answer')
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
