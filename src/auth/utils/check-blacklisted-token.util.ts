import { UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Checks if a token is blacklisted for a specific user.
 *
 * @param userId - The ID of the user.
 * @param tokenId - The ID of the token.
 * @param cacheManager - The cache manager used for storing blacklisted tokens.
 * @throws UnauthorizedException if the token is blacklisted.
 */
export const checkIfTokenIsBlacklisted = async (
  userId: string,
  tokenId: string,
  cacheManager: Cache,
): Promise<void> => {
  const time = await cacheManager.get<number>(`blacklist:${userId}:${tokenId}`);

  if (time != undefined && time != null) {
    throw new UnauthorizedException('Invalid token');
  }
};
