import * as path from 'path';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '@/core/config/type';
import {
  CLOUDINARY_CLIENT,
  type CloudinaryClient,
} from '../providers/cloudinary.provider';
import type { IMediaStorage } from './media-storage.interface';
import { MEDIA_STORAGE_PROVIDER } from './media-storage.interface';
import { CloudinaryMediaStorage } from './cloudinary.storage';
import { LocalMediaStorage } from './local.storage';

export const MediaStorageProvider: Provider = {
  provide: MEDIA_STORAGE_PROVIDER,
  inject: [ConfigService, CLOUDINARY_CLIENT],
  useFactory: (
    configService: ConfigService,
    cloudinary: CloudinaryClient,
  ): IMediaStorage => {
    const config = configService.get<AppConfig>('app')!;
    if (config.media.storage === 'local') {
      const uploadDir = path.resolve(config.media.localUploadDir);
      return new LocalMediaStorage(uploadDir, config.media.localBaseUrl);
    }
    return new CloudinaryMediaStorage(cloudinary);
  },
};
