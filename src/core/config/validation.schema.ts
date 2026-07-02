import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DOMAIN: Joi.string().required(),

  DATABASE_URL: Joi.string().required(),
  DATABASE_SSL: Joi.boolean().default(false),
  DATABASE_POOL_SIZE: Joi.number().min(1).max(100).default(10),

  REDIS_URL: Joi.string().required(),

  SESSION_NAME: Joi.string().required(),
  SESSION_SECRET: Joi.string().min(32).required(),
  SESSION_HTTP_ONLY: Joi.boolean().default(true),
  SESSION_MAX_AGE: Joi.number().default(7 * 24 * 60 * 60 * 1000), // 7 days
  SESSION_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').default('lax'),
  SESSION_SECURE: Joi.boolean().required(),

  MAIL_RESEND_DISABLED: Joi.boolean().default(false),
  RESEND_API_KEY: Joi.string().optional().allow(''),
  MAIL_FROM: Joi.string().optional().allow(''),

  GOOGLE_DISABLED: Joi.boolean().default(false),
  GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().optional().allow(''),
  FACEBOOK_DISABLED: Joi.boolean().default(false),
  FACEBOOK_APP_ID: Joi.string().optional().allow(''),
  FACEBOOK_APP_SECRET: Joi.string().optional().allow(''),

  HCAPTCHA_SECRET: Joi.string().required(),
});
