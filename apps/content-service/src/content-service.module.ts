import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogsModule } from './blogs/blogs.module';
import { QuestionsModule } from './questions/questions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AssetsModule } from './assets/assets.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BlogsModule,
    QuestionsModule,
    ReviewsModule,
    AssetsModule,
  ],
  controllers: [HealthController],
})
export class ContentServiceModule {}
