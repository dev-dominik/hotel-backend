/* eslint-disable @typescript-eslint/require-await */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const first = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0];
      return first.trim();
    }
    return req.ip ?? 'unknown';
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
  }
}
