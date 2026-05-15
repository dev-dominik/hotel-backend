import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  domain: string;
}

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000'),
  domain: process.env.DOMAIN,
}));
