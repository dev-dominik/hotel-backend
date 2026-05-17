import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import passport from 'passport';
import { Redis } from 'ioredis';
import { IoRedisStore } from '@/core/session/redis-session.store';
import { AppConfig } from '@/core/config/type';

export const passportBootstrap = (app: INestApplication) => {
  const config = app.get(ConfigService);
  const appConfig = config.get<AppConfig>('app');
  if (!appConfig) throw new Error('Config not found');

  const redisClient = new Redis(appConfig.redis.url);
  app.use(
    session({
      name: appConfig.session.name,
      store: new IoRedisStore(redisClient),
      secret: appConfig.session.secret,
      resave: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: appConfig.session.httpOnly,
        maxAge: appConfig.session.maxAge,
        sameSite: appConfig.session.sameSite,
        secure: appConfig.session.secure,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
};
