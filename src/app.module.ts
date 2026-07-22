import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { StatusModule } from './modules/status/status.module.js';
import { AppConfigModule } from './core/config/config.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MailModule } from './core/mail/mail.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { RoomsModule } from './modules/rooms/rooms.module.js';
import { ReservationsModule } from './modules/reservations/reservations.module.js';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        migrationsRun: true,
        logging:
          config.get('NODE_ENV') === 'production'
            ? ['error']
            : ['query', 'error', 'warn'],
        ssl:
          config.get('DATABASE_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        extra: {
          max: parseInt(config.get('DATABASE_POOL_SIZE') ?? '10'),
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        },
      }),
      inject: [ConfigService],
    }),
    StatusModule,
    AuthModule,
    UsersModule,
    MailModule,
    AdminModule,
    MediaModule,
    RoomsModule,
    ReservationsModule,
  ],
})
export class AppModule {}
