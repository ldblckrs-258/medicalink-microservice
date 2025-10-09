import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { BlogRepository } from './blog.repository';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService, BlogRepository],
  exports: [BlogsService, BlogRepository],
})
export class BlogsModule {}
