import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [TwoFactorAuthenticationController],
  providers: [
    TwoFactorAuthenticationService,
    AuthService,
    ConfigService,
    JwtService,
  ],
})
export class TwoFactorAuthenticationModule {}
