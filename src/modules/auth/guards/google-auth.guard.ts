import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppConfig } from '@/core/config/type';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly configService: ConfigService<{ app: AppConfig }>,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const appConfig = this.configService.get<AppConfig>('app')!;
    if (appConfig.google.disabled)
      throw new ForbiddenException('Google login is disabled');

    return super.canActivate(context);
  }
}

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  constructor(
    private readonly configService: ConfigService<{ app: AppConfig }>,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const appConfig = this.configService.get<AppConfig>('app')!;
    if (appConfig.google.disabled)
      throw new ForbiddenException('Google login is disabled');

    const result = (await super.canActivate(context)) as boolean;
    const req = context.switchToHttp().getRequest<Request>();
    await super.logIn(req);
    await new Promise<void>((resolve, reject) =>
      req.session.save((err: unknown) => (err ? reject(err) : resolve())),
    );
    return result;
  }
}
