import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.startegy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { SessionSerializer } from './serializers/session.serializer';
import { UsersModule } from '@/modules/users/users.module';
import { User } from '@/modules/users/entity/user.entity';
import { AuthController } from './auth.controller';
import { HCaptchaService } from './hcaptch.service';
import { MailModule } from '@/core/mail/mail.module';
import { AuthorizationGuard } from './guards/authorization.guard';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    MailModule,
    AppThrottlerModule,
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
