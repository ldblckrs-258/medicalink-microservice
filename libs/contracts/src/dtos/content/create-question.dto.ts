import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  authorId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
