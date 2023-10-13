import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsUrl()
  domain: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  description: string;

  @IsString()
  admin1GivenName: string;

  @IsString()
  @IsOptional()
  admin1FamilyName?: string;

  @IsString()
  @IsEmail()
  admin1Email: string;

  @IsString()
  admin1Password: string;

  @IsString()
  admin2GivenName: string;

  @IsString()
  @IsOptional()
  admin2FamilyName?: string;

  @IsString()
  @IsEmail()
  admin2Email: string;

  @IsString()
  admin2Password: string;
}
