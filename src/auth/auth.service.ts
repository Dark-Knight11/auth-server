import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { JwtService } from 'src/jwt/jwt.service';
import { MailerService } from 'src/mailer/mailer.service';
import { UserService } from 'src/user/user.service';
import {
  SignUpDto,
  SignInDto,
  EmailDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dtos';
import {
  blacklistToken,
  checkIfTokenIsBlacklisted,
  checkLastPassword,
  comparePasswords,
  findOneByUsernameorEmail,
  generateAuthTokens,
} from './utils';
import { TokenType } from 'src/jwt/enums/token-type.enum';
import * as argon from 'argon2';
import { Credentials, IAuthResult } from './interfaces';
import { IRefreshToken, IEmailToken } from 'src/jwt/interface';
import { IMessage } from 'src/common/interfaces/message.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Service responsible for handling authentication-related operations.
*/
@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Creates a new user in the database and sends a confirmation email.
   *
   * @param dto - The SignUpDto object containing the user's details.
   * @param domain - The domain to use for the confirmation link - (optional).
   * @throws BadRequestException - If the passwords do not match or the registration fails.
   * @throws UnauthorizedException - If the email is already in use.
   * @returns A message indicating the success of the registration.
   */
  async signUp(dto: SignUpDto, domain?: string) {
    const { name, email, password1, password2 } = dto;
    comparePasswords(password1, password2);
    try {
      const user = await this.userService.create(email, name, password1);
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenType.CONFIRMATION,
        domain,
      );
      this.mailerService.sendConfirmationMail(user, confirmationToken);
      return this.commonService.generateMessage(
        'Registration Successful.\nCheck your email to confirm your account.',
      );
    } catch (error) {
      if (error.code === 'P2002') {
        throw new UnauthorizedException('Email already in use');
      }
      throw new BadRequestException('Registration failed');
    }
  }

  /**
   * Sign in a user with the provided credentials.
   * If the user is not confirmed, a confirmation email is sent.
   *
   * @param dto - The sign-in data transfer object.
   * @param domain - The domain to use for the confirmation link - (optional).
   * @throws BadRequestException - If the username or password is invalid.
   * @throws UnauthorizedException - If the user's email is not confirmed.
   * @returns An object containing the signed-in user, access token, and refresh token.
   */
  async signIn(dto: SignInDto, domain?: string) {
    const { emailorUsername, password } = dto;
    const user = await findOneByUsernameorEmail(
      emailorUsername,
      this.userService,
    );

    if (!(await argon.verify(user.password, password))) {
      await checkLastPassword(user.credentials as Credentials, password);
    }

    if (!user.confirmed) {
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenType.CONFIRMATION,
        domain,
      );
      this.mailerService.sendConfirmationMail(user, confirmationToken);
      throw new UnauthorizedException(
        'Please confirm your email to continue. Confirmation email has been sent.',
      );
    }

    const [accessToken, refreshToken] = await generateAuthTokens(
      user,
      this.jwtService,
      domain,
    );

    return { user, accessToken, refreshToken };
  }

  /**
   * Refreshes an access token using a refresh token.
   *
   * @param refreshToken - The refresh token to use for refreshing the access token.
   * @param domain - The domain to associate with the access token.
   * @throws UnauthorizedException - If the refresh token is invalid or has been blacklisted.
   * @returns An object containing the user, new access token, and new refresh token.
   */
  async refreshToken(refreshToken: string, domain?: string) {
    const { id, version, tokenId } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenType.REFRESH,
      );
    await checkIfTokenIsBlacklisted(id, tokenId, this.cacheManager);
    const user = await this.userService.findOnebyCredentials(id, version);
    const [newAccessToken, newRefreshToken] = await generateAuthTokens(
      user,
      this.jwtService,
      domain,
      tokenId,
    );
    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logs out a user by invalidating the provided refresh token.
   *
   * @param refreshToken - The refresh token to be invalidated.
   * @throws UnauthorizedException - If the refresh token is invalid.
   * @returns A promise that resolves to an IMessage object indicating the success of the logout operation.
   */
  async logout(refreshToken: string): Promise<IMessage> {
    const { id, tokenId, exp } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenType.REFRESH,
      );
    await blacklistToken(
      id,
      tokenId,
      exp,
      this.commonService,
      this.cacheManager,
    );
    return this.commonService.generateMessage('Logout successful');
  }

  /**
   * Sends a reset password email to the user.
   *
   * @param dto - The email DTO containing the recipient's email address.
   * @param domain - The domain of the application (optional).
   * @throws UnauthorizedException - If the email address is not associated with any user.
   * @returns A promise that resolves to an IMessage object indicating the status of the email sending process.
   */
  async resetPasswordEmail(dto: EmailDto, domain?: string): Promise<IMessage> {
    const user = await this.userService.uncheckedUserByEmail(dto.email);
    if (user != undefined && user != null) {
      const resetToken = await this.jwtService.generateToken(
        user,
        TokenType.RESET_PASSWORD,
        domain,
      );
      this.mailerService.sendResetPasswordEmail(user, resetToken);
    }
    return this.commonService.generateMessage('Reset password email sent.');
  }

  /**
   * Resets the password for a user.
   *
   * @param dto - The DTO containing the password reset information.
   * @throws BadRequestException - If the passwords do not match.
   * @returns A Promise that resolves to an IMessage object indicating the success of the password reset.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<IMessage> {
    const { password1, password2, resetToken } = dto;
    const { id, version } = await this.jwtService.verifyToken<IEmailToken>(
      resetToken,
      TokenType.RESET_PASSWORD,
    );

    comparePasswords(password1, password2);
    await this.userService.resetPassword(id, password1, version);
    return this.commonService.generateMessage('Password reset successful');
  }

  /**
   * Changes the password for a user.
   *
   * @param userId - The ID of the user.
   * @param dto - The data transfer object containing the new and old passwords.
   * @throws BadRequestException - If the passwords do not match.
   * @returns A promise that resolves to an object containing the updated user, access token, and refresh token.
   */
  async changePasssword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<IAuthResult> {
    const { password1, password2, oldPassword } = dto;
    comparePasswords(password1, password2);
    const user = await this.userService.updatePassword(
      {
        password: oldPassword,
        newPassword: password1,
      },
      userId,
    );
    const [accessToken, refreshToken] = await generateAuthTokens(
      user,
      this.jwtService,
    );
    return { user, accessToken, refreshToken };
  }
}
