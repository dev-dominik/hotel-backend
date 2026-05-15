import { Module } from '@nestjs/common';
import { StatusModule } from './modules/status/status.module';
import { AppConfigModule } from './core/config/config.module';

@Module({
  imports: [AppConfigModule, StatusModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
