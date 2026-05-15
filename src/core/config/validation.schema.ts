import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number(),
  DOMAIN: Joi.string().required(),
});
