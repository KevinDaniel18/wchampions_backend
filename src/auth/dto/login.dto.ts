import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum AuthMethod {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(AuthMethod)
  @IsNotEmpty()
  authMethod: AuthMethod;
}
