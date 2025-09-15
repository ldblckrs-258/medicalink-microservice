import { Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  async createQuestion() {
    return this.questionsService.createQuestion();
  }

  @Get()
  async getQuestions() {
    return this.questionsService.getQuestions();
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionsService.getQuestionById(id);
  }

  @Put(':id')
  async updateQuestion(@Param('id') _id: string) {
    return this.questionsService.updateQuestion();
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') _id: string) {
    return this.questionsService.deleteQuestion();
  }

  @Post(':id/answers')
  async createAnswer(@Param('id') _questionId: string) {
    return this.questionsService.createAnswer();
  }

  @Get('answers')
  async getAnswers() {
    return this.questionsService.getAnswers();
  }

  @Put('answers/:id')
  async updateAnswer(@Param('id') _id: string) {
    return this.questionsService.updateAnswer();
  }

  @Delete('answers/:id')
  async deleteAnswer(@Param('id') _id: string) {
    return this.questionsService.deleteAnswer();
  }

  @Get('reviews')
  async getReviews() {
    return this.questionsService.getReviews();
  }

  @Post('reviews')
  async createReview() {
    return this.questionsService.createReview();
  }
}
