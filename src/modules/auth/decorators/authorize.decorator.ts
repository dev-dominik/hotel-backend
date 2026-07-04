import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@/modules/users/entity/user.role';
import { Permission } from '@/modules/users/entity/user.permission';
import { Roles } from './roles.decorator';
import { RequirePermissions } from './require-permissions.decorator';
import { AuthorizationGuard } from '../guards/authorization.guard';

interface AuthorizeOptions {
  roles?: UserRole[];
  permissions?: Permission[];
}

/**
 * Combines role + permission checks into a single decorator.
 * Roles: user must match at least ONE of the listed roles.
 * Permissions: user must have ALL listed permissions.
 */
export function Authorize(options: AuthorizeOptions = {}) {
  const decorators: (MethodDecorator & ClassDecorator)[] = [
    UseGuards(AuthorizationGuard),
  ];

  if (options.roles && options.roles.length > 0) {
    decorators.push(Roles(...options.roles));
  }

  if (options.permissions && options.permissions.length > 0) {
    decorators.push(RequirePermissions(...options.permissions));
  }

  return applyDecorators(...decorators);
}
