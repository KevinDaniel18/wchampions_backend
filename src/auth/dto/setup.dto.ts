import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class GoalDto {
  @IsString()
  @IsNotEmpty()
  meta: string;
}

export class SetupDto {
  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsInt()
  @Min(18)
  age: number;

  @IsInt()
  @Min(10)
  weight: number;

  @IsInt()
  @Min(122)
  height: number;

  @ValidateNested({ each: true })
  @Type(() => GoalDto)
  @IsOptional()
  goals?: GoalDto[];
}
