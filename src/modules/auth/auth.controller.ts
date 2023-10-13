import {
  Req,
  Controller,
  HttpCode,
  Get,
  Post,
  UseGuards,
  Res,
  Logger,
} from '@nestjs/common';
import { LocalAuthenticationGuard } from './guards/localAuthentication.guard';
import { AuthService } from './auth.service';
import RequestWithUser from './dto/RequestWithUser.dto';
import { Response } from 'express';
import JwtAuthenticationGuard from './guards/jwtAuthentication.guard';
import JwtRefreshGuard from './guards/jwtRefresh.guard';
import { ResponseWithUser } from './dto/ResponseWithUser.dto';

@Controller('authentication')
export class AuthController {
  constructor(private readonly authenticationService: AuthService) {}
  private readonly logger = new Logger(AuthService.name);

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(user.id);
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authenticationService.getCookieWithJwtRefreshToken(user.id);

    await this.authenticationService.setCurrentRefreshToken(
      refreshToken,
      user.id,
    );

    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie,
    ]);

    this.logger.log(`${user.email} has successfully logged in.`);

    return new ResponseWithUser(user);
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie =
      this.authenticationService.getCookieWithJwtAccessToken(request.user.id);

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    this.logger.log(
      `${request.user.email} has successfully refreshed their token.`,
    );
    return new ResponseWithUser(request.user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    this.logger.log(`${request.user.email} has successfully logged out.`);
    return response.sendStatus(200);
  }
}
