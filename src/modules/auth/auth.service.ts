import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import type { User } from '@/modules/users/entity/user.entity';
import type { ClientUser } from '@/modules/users/entity/user-client.entity';
import type { RegisterRequest } from './dto/register.dto';
import { AuthProvider } from './entity/auth.provider';
import { HCaptchaService } from './hcaptch.service';
import { MailService } from '@/core/mail/mail.service';
import appConfigType from '@/core/config/type';
import type { AppConfig } from '@/core/config/type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hCaptchaService: HCaptchaService,
    private readonly mailService: MailService,
    @Inject(appConfigType.KEY) private readonly config: AppConfig,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) return null;

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return null;

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before signing in',
      );
    }

    return user;
  }

  async register(data: {
    dto: RegisterRequest;
    ip: string;
  }): Promise<ClientUser> {
    const { dto, ip } = data;
    await this.hCaptchaService.verifyToken({
      token: dto.hCaptchaToken,
      remoteIp: ip,
    });

    const { user, emailConfirmToken } = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      password: dto.password,
    });

    const confirmUrl = `${this.config.domain}/auth/confirm-email?token=${emailConfirmToken}`;
    await this.mailService.sendEmail({
      to: dto.email,
      subject: 'Confirm your email address',
      html: `
        <div style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:24px;margin-bottom:8px">Confirm your email address</h1>
          <p style="color:#555;margin-bottom:24px">Click the button below to confirm your email and activate your account.</p>
          <a href="${confirmUrl}" style="background:#c9a96e;color:#fff;text-decoration:none;padding:12px 24px;display:inline-block;font-weight:600">Confirm Email</a>
          <p style="color:#aaa;font-size:13px;margin-top:24px">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      isBlocked: user.isBlocked,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async confirmEmail(token: string): Promise<void> {
    await this.usersService.confirmEmail(token);
  }

  async findOrCreateOAuthUser(data: {
    email: string;
    emailVerified?: boolean;
    name: string;
    provider: AuthProvider;
  }): Promise<User> {
    return await this.usersService.findOrCreateOAuthUser(data);
  }

  toClientUser(user: User): ClientUser {
    return this.usersService.toClientUser(user);
  }
}
