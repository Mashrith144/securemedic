import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  givenName: string;

  @IsString()
  familyName?: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
