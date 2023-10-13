import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Body,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { Response } from 'express';
import JwtAuthenticationGuard from '../auth/guards/jwtAuthentication.guard';
import RequestWithUser from '../auth/dto/RequestWithUser.dto';
import { AuthService } from '../auth/auth.service';
import { TwoFactorAuthenticationCodeDto } from './dto/TwoFactorAuthenticationCodeDto.dto';
import { ResponseWithUser } from '../auth/dto/ResponseWithUser.dto';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  private readonly logger = new Logger(TwoFactorAuthenticationService.name);

  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly authService: AuthService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthenticationGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        request.user,
      );
    this.logger.log(`${request.user.email} has generated a 2FA QR code.`);
    return this.twoFactorAuthenticationService.pipeQrCodeStream(
      response,
      otpauthUrl,
    );
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.authService.turnOnTwoFactorAuthentication(request.user.id);
    this.logger.log(
      `${request.user.email} has successfully enabled 2FA for their account.`,
    );

    request.res.status(200).json('OK');
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    const isCodeValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        request.user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user.id,
      true,
    );

    request.res
      .setHeader('Set-Cookie', [accessTokenCookie])
      .status(200)
      .json(new ResponseWithUser(request.user));

    this.logger.log(
      `${request.user.email} has successfully authenticated using 2FA`,
    );
  }
}
