import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common';

export class WorkLocationPublicQueryDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string = 'name';

  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  @IsIn(['ASC', 'DESC'], {
    message: 'Sort order must be either ASC or DESC',
  })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
