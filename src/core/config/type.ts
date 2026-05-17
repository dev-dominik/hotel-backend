import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  domain: string;
  database: {
    url: string;
    ssl: boolean;
    poolSize: number;
  };
  redis: {
    url: string;
  };
  session: {
    name: string;
    secret: string;
    httpOnly: boolean;
    maxAge: number;
    sameSite: 'lax' | 'strict' | 'none';
    secure: boolean;
  };
}

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000'),
  domain: process.env.DOMAIN,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE ?? '10'),
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  session: {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    httpOnly: process.env.SESSION_HTTP_ONLY !== 'false',
    maxAge: parseInt(process.env.SESSION_MAX_AGE ?? '604800000'), // 7 days
    sameSite: process.env.SESSION_SAME_SITE || 'lax',
    secure: process.env.SESSION_SECURE === 'true',
  },
}));
