import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { BlogsService } from './blogs/blogs.service';
import { BlogsController } from './blogs/blogs.controller';
import { QuestionsService } from './questions/questions.service';
import { QuestionsController } from './questions/questions.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [BlogsController, QuestionsController, HealthController],
  providers: [PrismaService, BlogsService, QuestionsService],
})
export class ContentServiceModule {}
