import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  Public,
  RequirePermission,
  RequireUpdatePermission,
  RequireDeletePermission,
} from '@app/contracts';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateAnswerDto,
} from '@app/contracts';
import {
  GetQuestionsQueryDto,
  GetAnswersQueryDto,
} from '@app/contracts/dtos/content';
import { MicroserviceService } from '../utils/microservice.service';
import { PublicCreateThrottle } from '../utils/custom-throttle.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
    private readonly microserviceService: MicroserviceService,
  ) {}

  // Public - create question
  @Public()
  @PublicCreateThrottle()
  @Post()
  async createQuestion(@Body() dto: CreateQuestionDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'create_question',
      dto,
    );
  }

  // Public - list questions
  @Public()
  @Get()
  async findQuestions(@Query() query: GetQuestionsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_questions',
      query,
    );
  }

  // Public - get question by id
  @Public()
  @Get(':id')
  async findQuestionById(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_question_by_id',
      { id },
    );
  }

  // Admin - update question
  @RequireUpdatePermission('questions')
  @Patch(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'update_question',
      { id, data: dto },
    );
  }

  // Admin - delete question
  @RequireDeletePermission('questions')
  @Delete(':id')
  async removeQuestion(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'delete_question',
      { id },
    );
  }

  // Doctor - create answer
  @RequirePermission('answers', 'create')
  @Post(':id/answers')
  async createAnswer(
    @Param('id') questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'create_answer',
      { ...dto, questionId },
    );
  }

  // Public - list accepted answers for a question
  @Public()
  @Get(':id/answers')
  async getAnswers(
    @Param('id') questionId: string,
    @Query() query: GetAnswersQueryDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_answers',
      { questionId, ...query, acceptedOnly: true },
    );
  }

  // Public - get single answer (should be accepted by service policy)
  @Public()
  @Get('/answers/:answerId')
  async getAnswerById(@Param('answerId') answerId: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'get_answer_by_id',
      { id: answerId },
    );
  }

  // Admin - update answer
  @RequireUpdatePermission('answers')
  @Patch('/answers/:answerId')
  async updateAnswer(
    @Param('answerId') answerId: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'update_answer',
      { id: answerId, data: dto },
    );
  }

  // Admin - delete answer
  @RequireDeletePermission('answers')
  @Delete('/answers/:answerId')
  async deleteAnswer(@Param('answerId') answerId: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'delete_answer',
      { id: answerId },
    );
  }

  // Admin - accept answer (quick endpoint)
  @RequirePermission('answers', 'manage')
  @Post('/answers/:answerId/accept')
  async acceptAnswer(@Param('answerId') answerId: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      'update_answer',
      { id: answerId, data: { accepted: true } },
    );
  }
}
