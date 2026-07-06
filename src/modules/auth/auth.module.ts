import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '@/modules/auth/auth.service';
import { LocalStrategy } from '@/modules/auth/strategies/local.startegy';
import { GoogleStrategy } from '@/modules/auth/strategies/google.strategy';
import { FacebookStrategy } from '@/modules/auth/strategies/facebook.strategy';
import { SessionSerializer } from '@/modules/auth/serializers/session.serializer';
import { UsersModule } from '@/modules/users/users.module';
import { User } from '@/modules/users/entity/user.entity';
import { AuthController } from '@/modules/auth/auth.controller';
import { HCaptchaService } from '@/modules/auth/hcaptch.service';
import { MailModule } from '@/core/mail/mail.module';
import { AuthorizationGuard } from '@/modules/auth/guards/authorization.guard';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { RedisModule } from '@/core/redis/redis.module';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    MailModule,
    AppThrottlerModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    HCaptchaService,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    SessionSerializer,
    AuthorizationGuard,
    AppThrottlerGuard,
  ],
  exports: [SessionSerializer, AuthorizationGuard],
})
export class AuthModule {}
