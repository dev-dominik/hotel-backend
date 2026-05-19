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
  google: {
    disabled: boolean;
    clientId: string;
    clientSecret: string;
  };
  facebook: {
    disabled: boolean;
    appId: string;
    appSecret: string;
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
  google: {
    disabled: process.env.GOOGLE_DISABLED === 'true',
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
  facebook: {
    disabled: process.env.FACEBOOK_DISABLED === 'true',
    appId: process.env.FACEBOOK_APP_ID ?? '',
    appSecret: process.env.FACEBOOK_APP_SECRET ?? '',
  },
}));
