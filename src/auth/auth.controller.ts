import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ConfirmEmailDto,
  EmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './dtos';
import { AuthGuard } from './guards/auth.guard';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { CurrentUser, Origin, Public } from './decorators';
import { Response, Request } from 'express-serve-static-core';
import { refreshTokenFromReq, saveRefreshCookie } from './utils';
import { AuthResponseMapper, AuthResponseUserMapper } from './mappers';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
@UseGuards(AuthGuard)
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  @Public()
  @Post('sign-up')
  async signUp(
    @Origin() origin: string | undefined,
    @Body() signUpDto: SignUpDto,
  ) {
    return await this.authService.signUp(signUpDto, origin);
  }

  @Public()
  @Post('sign-in')
  async signIn(
    @Res() res: Response,
    @Origin() origin: string | undefined,
    @Body() signInDto: SignInDto,
  ) {
    const result = await this.authService.signIn(signInDto, origin);
    saveRefreshCookie(
      res,
      result.refreshToken,
      this.cookieName,
      this.cookiePath,
      this.refreshTime,
    )
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Public()
  @Post('refreshToken')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const token = refreshTokenFromReq(req, this.cookieName);
    const result = await this.authService.refreshToken(
      token,
      req.headers.origin,
    );
    saveRefreshCookie(
      res,
      result.refreshToken,
      this.cookieName,
      this.cookiePath,
      this.refreshTime,
    )
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = refreshTokenFromReq(req, this.cookieName);
    const message = await this.authService.logout(token);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.OK)
      .json(message);
  }

  @Public()
  @Post('confirm-email')
  async confirmEmail(
    @Origin() origin: string | undefined,
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.confirmEmail(confirmEmailDto, origin);
    saveRefreshCookie(
      res,
      result.refreshToken,
      this.cookieName,
      this.cookiePath,
      this.refreshTime,
    )
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Post('forgot-password')
  async resetPasswordEmail(
    @Origin() origin: string | undefined,
    @Body() emailDto: EmailDto,
  ) {
    return this.authService.resetPasswordEmail(emailDto, origin);
  }

  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('update-password')
  async changePassword(
    @CurrentUser() userId: string,
    @Origin() origin: string | undefined,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.changePassword(
      userId,
      changePasswordDto,
      origin,
    );
    saveRefreshCookie(
      res,
      result.refreshToken,
      this.cookieName,
      this.cookiePath,
      this.refreshTime,
    )
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Get('me')
  async getMe(@CurrentUser() userId: string) {
    const res = await this.userService.findOneById(userId);
    return AuthResponseUserMapper.map(res);
  }
}
