import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinaryV2 } from 'cloudinary';
import type { AppConfig } from '@/core/config/type';

export const CLOUDINARY_CLIENT = Symbol('CLOUDINARY_CLIENT');

export type CloudinaryClient = typeof cloudinaryV2;

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): CloudinaryClient => {
    const appConfig = config.get<AppConfig>('app')!;
    cloudinaryV2.config({
      cloud_name: appConfig.cloudinary.cloudName,
      api_key: appConfig.cloudinary.apiKey,
      api_secret: appConfig.cloudinary.apiSecret,
    });
    return cloudinaryV2;
  },
};
