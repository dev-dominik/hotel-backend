import * as path from 'path';
import * as fs from 'fs';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/core/config/type';

export const appBootstrap = async (app: INestApplication) => {
  const config = app.get(ConfigService);
  const appConfig = config.get<AppConfig>('app');
  if (!appConfig) throw new Error('Config not found');

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  app.enableCors({
    origin: appConfig.domain,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  if (appConfig.media.storage === 'local') {
    const uploadDir = path.resolve(appConfig.media.localUploadDir);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    (app as NestExpressApplication).useStaticAssets(uploadDir, {
      prefix: '/uploads',
    });
  }

  const logger = new Logger('Bootstrap');
  await app.listen(appConfig.port).then(() => {
    logger.log(`Application is running on port ${appConfig.port}`);
    if (appConfig.media.storage === 'local') {
      logger.log(
        `Local media storage enabled — serving uploads from ${path.resolve(appConfig.media.localUploadDir)}`,
      );
    }
  });
};
