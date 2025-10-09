import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogsModule } from './blogs/blogs.module';
import { QuestionsModule } from './questions/questions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BlogsModule,
    QuestionsModule,
    ReviewsModule,
  ],
  controllers: [HealthController],
})
export class ContentServiceModule {}
