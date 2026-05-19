import { PickType } from '@nestjs/swagger';
import { User } from './user.entity';

export class ClientUser extends PickType(User, [
  'id',
  'email',
  'name',
  'role',
  'permissions',
  'authProvider',
  'lastLoginAt',
  'createdAt',
]) {}
