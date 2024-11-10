import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class Verify2faDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  code: string;
}
