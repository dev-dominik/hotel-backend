import type { User as UserEntity } from '../modules/users/entity/user.entity.js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserEntity {}
  }
}
