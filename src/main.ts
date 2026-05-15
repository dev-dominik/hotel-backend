import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appBootstrap } from './core/boostrap/app.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await appBootstrap(app);
}
bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap', error);
  process.exit(1);
});
