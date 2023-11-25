import dayjs from 'dayjs';
import { CommonService } from 'src/common/common.service';
import { Cache } from 'cache-manager';

/**
 * Blacklists a token by storing its entry time and ttl as expiration time in the cache .
 *
 * @param userId - The ID of the user associated with the token.
 * @param tokenId - The ID of the token to be blacklisted.
 * @param exp - The expiration time of the token.
 * @param commonService - An instance of the CommonService class.
 * @param cacheManager - An instance of the Cache class.
 * @returns A Promise that resolves when the token is blacklisted.
 */
export const blacklistToken = async (
  userId: string,
  tokenId: string,
  exp: number,
  commonService: CommonService,
  cacheManager: Cache,
): Promise<void> => {
  const now = dayjs().unix();
  const ttl = (exp - now) * 1000;

  if (ttl > 0) {
    await commonService.throwInternalError(
      cacheManager.set(`blacklist:${userId}:${tokenId}`, now, ttl),
    );
  }
};
