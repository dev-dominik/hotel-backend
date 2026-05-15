import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/core/config/type';

export const appBootstrap = async (app: INestApplication) => {
  const config = app.get(ConfigService).get<AppConfig>('app');
  if (!config) throw new Error('Config not found');

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  const logger = new Logger('Bootstrap');
  await app.listen(config.port).then(() => {
    logger.log(`Application is running on: ${config.domain}:${config.port}`);
  });
};
