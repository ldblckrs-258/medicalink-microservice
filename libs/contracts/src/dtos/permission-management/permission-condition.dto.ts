import { IsString, IsEnum } from 'class-validator';

export class PermissionConditionDto {
  @IsString()
  field: string;

  @IsEnum(['equals', 'not_equals', 'in', 'not_in', 'contains'])
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';

  @IsString()
  value: any;
}
