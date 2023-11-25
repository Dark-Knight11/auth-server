import { User } from '@prisma/client';
import { TokenType } from 'src/jwt/enums/token-type.enum';
import { JwtService } from 'src/jwt/jwt.service';

/**
 * Generates authentication tokens for a user.
 *
 * @param user - The user object.
 * @param jwtService - The JWT service used for token generation.
 * @param domain - Optional domain for the tokens.
 * @param tokenId - Optional token ID.
 * @returns A promise that resolves to an array of two strings representing the access token and refresh token.
 */
export const generateAuthTokens = async (
  user: User,
  jwtService: JwtService,
  domain?: string,
  tokenId?: string,
): Promise<[string, string]> => {
  return Promise.all([
    jwtService.generateToken(user, TokenType.ACCESS, domain, tokenId),
    jwtService.generateToken(user, TokenType.REFRESH, domain, tokenId),
  ]);
};
