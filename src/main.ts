import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appBootstrap } from './core/boostrap/app.bootstrap';
import { passportBootstrap } from './core/boostrap/passport.boostrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  passportBootstrap(app);
  await appBootstrap(app);
}
bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap', error);
  process.exit(1);
});
