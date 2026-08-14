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
  mail: {
    resend: {
      disabled: boolean;
      apiKey: string;
    };
    from: string;
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
  hCaptcha: {
    secret: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  media: {
    storage: 'local' | 'cloudinary';
    localUploadDir: string;
    localBaseUrl: string;
  };
  payments: {
    currency: string;
    stripe: {
      disabled: boolean;
      secretKey: string;
      webhookSecret: string;
      successUrl: string;
      cancelUrl: string;
    };
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
  mail: {
    resend: {
      disabled: process.env.MAIL_RESEND_DISABLED === 'true',
      apiKey: process.env.RESEND_API_KEY,
    },
    from: process.env.MAIL_FROM,
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
  hCaptcha: {
    secret: process.env.HCAPTCHA_SECRET,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  media: {
    storage: (process.env.MEDIA_STORAGE || 'cloudinary') as
      | 'local'
      | 'cloudinary',
    localUploadDir: process.env.MEDIA_LOCAL_UPLOAD_DIR || './uploads',
    localBaseUrl: process.env.MEDIA_LOCAL_BASE_URL || 'http://localhost:3000',
  },
  payments: {
    currency: process.env.PAYMENTS_CURRENCY || 'PLN',
    stripe: {
      disabled: process.env.STRIPE_DISABLED === 'true',
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      successUrl: process.env.STRIPE_SUCCESS_URL,
      cancelUrl: process.env.STRIPE_CANCEL_URL,
    },
  },
}));
