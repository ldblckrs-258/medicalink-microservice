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
  CurrentUser,
  RequireReadPermission,
} from '@app/contracts/decorators';
import { QUESTIONS_PATTERNS, ANSWERS_PATTERNS } from '@app/contracts/patterns';
import { MicroserviceService } from '../utils/microservice.service';
import { PublicCreateThrottle } from '../utils/custom-throttle.decorator';
import {
  type JwtPayloadDto,
  PaginationDto,
  GetQuestionsQueryDto,
  GetAnswersQueryDto,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateSelfAnswerDto,
  UpdateAnswerDto,
} from '@app/contracts/dtos';

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
      QUESTIONS_PATTERNS.CREATE,
      dto,
    );
  }

  // Public - list questions
  @Public()
  @Get()
  async findQuestions(@Query() query: GetQuestionsQueryDto) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      QUESTIONS_PATTERNS.GET_LIST,
      query,
    );
  }

  // Public - get question by id
  @Public()
  @Get(':id')
  async findQuestionById(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      QUESTIONS_PATTERNS.GET_BY_ID,
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
      QUESTIONS_PATTERNS.UPDATE,
      {
        id,
        updateQuestionDto: dto,
      },
    );
  }

  // Admin - delete question
  @RequireDeletePermission('questions')
  @Delete(':id')
  async removeQuestion(@Param('id') id: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      QUESTIONS_PATTERNS.DELETE,
      {
        id,
      },
    );
  }

  // Doctor - create answer
  @RequirePermission('answers', 'create')
  @Post(':id/answers')
  async createAnswer(
    @Param('id') questionId: string,
    @Body() dto: CreateAnswerDto,
    @CurrentUser() user: JwtPayloadDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.CREATE,
      { ...dto, questionId, authorId: user.sub },
    );
  }

  // Public - list answers for a question
  @Public()
  @Get(':id/answers/accepted')
  async getAcceptedAnswers(
    @Param('id') questionId: string,
    @Query() query: PaginationDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.GET_LIST,
      { questionId, ...query, isAccepted: true },
    );
  }

  @RequireReadPermission('questions')
  @Get(':id/answers')
  async getAnswers(
    @Param('id') questionId: string,
    @Query() query: GetAnswersQueryDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.GET_LIST,
      { questionId, ...query },
    );
  }

  // Public - get single answer
  @Public()
  @Get('/answers/:answerId')
  async getAnswerById(@Param('answerId') answerId: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.GET_BY_ID,
      { id: answerId },
    );
  }

  // Admin/Author - update answer
  @RequireUpdatePermission('answers', { isSelf: true })
  @Patch('/answers/:answerId')
  async updateAnswer(
    @Param('answerId') answerId: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.UPDATE,
      {
        id: answerId,
        updateAnswerDto: dto,
      },
    );
  }

  @RequireUpdatePermission('answers')
  @Patch('/answers/:answerId/accept')
  async acceptAnswer(@Param('answerId') answerId: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.UPDATE,
      {
        id: answerId,
        updateAnswerDto: { isAccepted: true },
      },
    );
  }

  // Admin/Author - delete answer
  @RequireDeletePermission('answers')
  @Delete('/answers/:answerId')
  async deleteAnswer(@Param('answerId') answerId: string) {
    return this.microserviceService.sendWithTimeout(
      this.contentClient,
      ANSWERS_PATTERNS.DELETE,
      {
        id: answerId,
      },
    );
  }
}
