import { RedisOptions } from 'ioredis';
import { IEmailConfig } from './email.interface';
import { IJwt } from './jwt.interface';
import { ThrottlerOptions } from '@nestjs/throttler';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  jwt: IJwt;
  emailService: IEmailConfig;
  redis: RedisOptions;
  throttler: ThrottlerOptions;
}
