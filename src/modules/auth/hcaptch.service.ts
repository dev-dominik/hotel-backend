import { AppConfig } from '@/core/config/type';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type HCaptchaVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  credit?: boolean;
  'error-codes'?: string[];
};

@Injectable()
export class HCaptchaService {
  private readonly verifyUrl = 'https://api.hcaptcha.com/siteverify';

  constructor(private readonly configService: ConfigService) {}

  async verifyToken(data: { token: string; remoteIp: string }): Promise<void> {
    const { token, remoteIp } = data;

    const appConfig = this.configService.get<AppConfig>('app');
    if (!appConfig)
      throw new InternalServerErrorException('App config not found');

    const secret = appConfig.hCaptcha.secret;
    if (!secret)
      throw new InternalServerErrorException(
        'Missing hCaptcha secret key in configuration',
      );
    if (!token) throw new BadRequestException('Missing hCaptcha token');

    const body = new URLSearchParams();
    body.append('secret', secret);
    body.append('response', token);
    body.append('remoteip', remoteIp);

    let result: HCaptchaVerifyResponse;
    try {
      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok)
        throw new Error(`hCaptcha returned HTTP ${response.status}`);

      result = await response.json();
    } catch {
      throw new InternalServerErrorException('Could not verify hCaptcha');
    }

    console.log('hCaptcha verification result:', result);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid hCaptcha token',
        errors: result['error-codes'] ?? [],
      });
    }
  }
}
