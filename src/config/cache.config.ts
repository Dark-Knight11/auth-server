import { CacheOptionsFactory } from '@nestjs/cache-manager';
import { CacheModuleOptions } from '@nestjs/cache-manager/dist';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

/**
 * Configuration class for cache options.
 */
@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Creates cache options.
   *
   * @returns A promise that resolves to the cache module options.
   */
  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      store: await redisStore({
        ...this.configService.get('redis'),
        ttl: this.configService.get<number>('jwt.refresh.time') * 1000,
      }),
    };
  }
}
