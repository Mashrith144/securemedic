import { IsBoolean, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  domain: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  description: string;
}
