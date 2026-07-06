import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { AppConfig } from '@/core/config/type';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const appConfig = config.get<AppConfig>('app')!;
        return new Redis(appConfig.redis.url);
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
