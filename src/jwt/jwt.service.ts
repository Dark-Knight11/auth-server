import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from 'src/common/common.service';
import { IAccessToken, IEmailToken, IRefreshToken } from './interface';
import { TokenType } from './enums/token-type.enum';
import { IJwt } from 'src/config/interface';
import { generateToken, throwBadRequest, verifyToken } from './utils';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
/**
 * Service for handling JSON Web Tokens (JWT).
 */
export class JwtService {
  private readonly jwtConfig: IJwt;
  private readonly issuer: string;
  private readonly domain: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {
    this.jwtConfig = this.configService.get<IJwt>('jwt');
    this.issuer = this.configService.get<string>('id');
    this.domain = this.configService.get<string>('domain');
  }

  /**
   * Generates a JWT token based on the provided user and token type.
   *
   * @param user - The user object.
   * @param tokenType - The type of token to generate.
   * @param domain - Optional. The domain for the token.
   * @param tokenId - Optional. The ID of the token.
   * @throws InternalServerErrorException if the token generation fails.
   * @returns The generated JWT token.
   */
  async generateToken(
    user: User,
    tokenType: TokenType,
    domain?: string | null,
    tokenId?: string,
  ) {
    const jwtOptions = (jwt.SignOptions = {
      issuer: this.issuer,
      subject: user.email,
      audience: domain ?? this.domain,
      algorithm: 'HS256',
    });

    switch (tokenType) {
      case TokenType.ACCESS:
        const { privateKey: accessSecret, time: accessTime } =
          this.jwtConfig.access;
        return this.commonService.throwInternalError(
          generateToken({ id: user.id }, accessSecret, {
            ...jwtOptions,
            expiresIn: accessTime,
            algorithm: 'RS256',
          }),
        );

      case TokenType.REFRESH:
        const { secret: refreshSecret, time: refreshTime } =
          this.jwtConfig.refresh;
        return this.commonService.throwInternalError(
          generateToken(
            {
              id: user.id,
              version: user.credentials['version'],
              tokenId: tokenId ?? uuid(),
            },
            refreshSecret,
            {
              ...jwtOptions,
              expiresIn: refreshTime,
            },
          ),
        );

      case TokenType.CONFIRMATION:
      case TokenType.RESET_PASSWORD:
        const { secret, time } = this.jwtConfig[tokenType];
        return this.commonService.throwInternalError(
          generateToken(
            { id: user.id, version: user.credentials['version'] },
            secret,
            {
              ...jwtOptions,
              expiresIn: time,
            },
          ),
        );
    }
  }

  /**
   * Verifies a token of type T.
   *
   * @template T - The type of token to verify.
   * @param token - The token to verify.
   * @param tokenType - The type of token being verified.
   * @throws BadRequestException if the token is invalid.
   * @returns - A promise that resolves to the verified token of type T.
   */
  async verifyToken<T extends IAccessToken | IRefreshToken | IEmailToken>(
    token: string,
    tokenType: TokenType,
  ): Promise<T> {
    const jwtOptions = (jwt.VerifyOptions = {
      issuer: this.issuer,
      audience: new RegExp(this.domain),
    });

    switch (tokenType) {
      case TokenType.ACCESS:
        const { publicKey: accessSecret, time: accessTime } =
          this.jwtConfig.access;
        return throwBadRequest(
          verifyToken(token, accessSecret, {
            ...jwtOptions,
            maxAge: accessTime,
            algorithms: ['RS256'],
          }),
        );

      case TokenType.REFRESH:
      case TokenType.CONFIRMATION:
      case TokenType.RESET_PASSWORD:
        const { secret, time } = this.jwtConfig[tokenType];
        return throwBadRequest(
          verifyToken(token, secret, {
            ...jwtOptions,
            maxAge: time,
            algorithms: ['HS256'],
          }),
        );
    }
  }
}
