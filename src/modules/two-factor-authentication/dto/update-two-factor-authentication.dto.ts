import { PartialType } from '@nestjs/mapped-types';
import { CreateTwoFactorAuthenticationDto } from './create-two-factor-authentication.dto';

export class UpdateTwoFactorAuthenticationDto extends PartialType(CreateTwoFactorAuthenticationDto) {}
