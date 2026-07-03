import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthProvider } from '../entity/auth.provider';
import type { AppConfig } from '@/core/config/type';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly disabled: boolean;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService<{ app: AppConfig }>,
  ) {
    const appConfig = configService.get<AppConfig>('app')!;
    super({
      clientID: appConfig.facebook.appId,
      clientSecret: appConfig.facebook.appSecret,
      callbackURL: `${appConfig.domain}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails'],
    });
    this.disabled = appConfig.facebook.disabled;
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: unknown, user?: Express.User | false) => void,
  ): Promise<void> {
    if (this.disabled) {
      done(new UnauthorizedException('Facebook login is disabled'));
      return;
    }

    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('No email returned from Facebook'));
      return;
    }

    const user = await this.authService.findOrCreateOAuthUser({
      email,
      name: profile.displayName,
      provider: AuthProvider.FACEBOOK,
    });

    done(null, user);
  }
}
