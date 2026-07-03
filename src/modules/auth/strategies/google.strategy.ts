import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type Profile,
  type VerifyCallback,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../entity/auth.provider';
import type { AppConfig } from '@/core/config/type';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly disabled: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    configService: ConfigService<{ app: AppConfig }>,
  ) {
    const appConfig = configService.get<AppConfig>('app')!;
    super({
      clientID: appConfig.google.clientId,
      clientSecret: appConfig.google.clientSecret,
      callbackURL: `${appConfig.domain}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
    });
    this.disabled = appConfig.google.disabled;
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    if (this.disabled) {
      done(new UnauthorizedException('Google login is disabled'));
      return;
    }

    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('No email returned from Google'));
      return;
    }
    const emailVerified = profile.emails?.[0]?.verified === true;
    if (!emailVerified) {
      done(new UnauthorizedException('Email not verified by Google'));
      return;
    }

    const user = await this.authService.findOrCreateOAuthUser({
      email,
      name: profile.displayName,
      provider: AuthProvider.GOOGLE,
      emailVerified,
    });

    done(null, user);
  }
}
