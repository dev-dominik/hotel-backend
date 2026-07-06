import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';
import { UsersService } from '@/modules/users/users.service';
import type { User } from '@/modules/users/entity/user.entity';
import type { ClientUser } from '@/modules/users/entity/user-client.entity';
import type { RegisterRequest } from '@/modules/auth/dto/register.dto';
import { AuthProvider } from '@/modules/auth/entity/auth.provider';
import { HCaptchaService } from '@/modules/auth/hcaptch.service';
import { MailService } from '@/core/mail/mail.service';
import appConfigType from '@/core/config/type';
import type { AppConfig } from '@/core/config/type';
import { REDIS_CLIENT } from '@/core/redis/redis.module';

const RESET_PREFIX = 'pwd-reset:';
const RESET_TTL_SECONDS = 3600;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly hCaptchaService: HCaptchaService,
    private readonly mailService: MailService,
    @Inject(appConfigType.KEY) private readonly config: AppConfig,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
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
    try {
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
    } catch (err) {
      this.logger.error(
        `Failed to send email confirmation to ${dto.email}`,
        err,
      );
    }

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

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.authProvider !== AuthProvider.LOCAL) return;

    const token = crypto.randomBytes(32).toString('hex');
    await this.redis.setex(
      `${RESET_PREFIX}${token}`,
      RESET_TTL_SECONDS,
      user.id,
    );

    const resetUrl = `${this.config.domain}/auth/reset-password?token=${token}`;
    try {
      await this.mailService.sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: `
          <div style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px">
            <h1 style="font-size:24px;margin-bottom:8px">Reset your password</h1>
            <p style="color:#555;margin-bottom:24px">Click the button below to set a new password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="background:#c9a96e;color:#fff;text-decoration:none;padding:12px 24px;display:inline-block;font-weight:600">Reset Password</a>
            <p style="color:#aaa;font-size:13px;margin-top:24px">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${email}`, err);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const userId = await this.redis.get(`${RESET_PREFIX}${token}`);
    if (!userId)
      throw new BadRequestException('Invalid or expired reset token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(password, 12);
    await this.usersService.updatePassword(user.id, passwordHash);

    await this.redis.del(`${RESET_PREFIX}${token}`);
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
