import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum AuthMethod {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  userName: string;

  @IsEmail() email: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsEnum(AuthMethod)
  @IsNotEmpty()
  authMethod: AuthMethod;
}
