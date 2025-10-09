import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsUUID } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsUUID()
  id: string;
}
