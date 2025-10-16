import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlogsModule } from './blogs/blogs.module';
import { QuestionsModule } from './questions/questions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AssetsModule } from './assets/assets.module';
import { HealthController } from './health/health.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BlogsModule,
    QuestionsModule,
    ReviewsModule,
    AssetsModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class ContentServiceModule {}
