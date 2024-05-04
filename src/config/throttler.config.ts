import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { RedisOptions } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configservice: ConfigService) {}
  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [{ ...this.configservice.get<ThrottlerOptions>('throttler') }],
      storage: new ThrottlerStorageRedisService(
        this.configservice.get<RedisOptions>('redis'),
      ),
    };
  }
}
