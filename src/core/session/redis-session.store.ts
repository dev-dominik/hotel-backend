import { Store, SessionData } from 'express-session';
import { Redis } from 'ioredis';

const PREFIX = 'sess:';

export class IoRedisStore extends Store {
  constructor(private readonly client: Redis) {
    super();
  }

  get(
    sid: string,
    callback: (err: unknown, session?: SessionData | null) => void,
  ): void {
    this.client.get(PREFIX + sid).then(
      (data) => {
        callback(null, data ? (JSON.parse(data) as SessionData) : null);
      },
      (err) => {
        callback(err);
      },
    );
  }

  set(
    sid: string,
    session: SessionData,
    callback?: (err?: unknown) => void,
  ): void {
    try {
      const ttl = session.cookie?.maxAge
        ? Math.floor(session.cookie.maxAge / 1000)
        : 86400;
      this.client.setex(PREFIX + sid, ttl, JSON.stringify(session)).then(
        () => {
          callback?.();
        },
        (err) => {
          callback?.(err);
        },
      );
    } catch (err) {
      callback?.(err);
    }
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    this.client.del(PREFIX + sid).then(
      () => {
        callback?.();
      },
      (err) => {
        callback?.(err);
      },
    );
  }
}
