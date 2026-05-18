import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
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

  const logger = new Logger('Bootstrap');
  await app.listen(appConfig.port).then(() => {
    logger.log(
      `Application is running on: ${appConfig.domain}:${appConfig.port}`,
    );
  });
};
