import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { UserRole } from '@/modules/users/entity/user.role';
import { Permission } from '@/modules/users/entity/user.permission';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.isAuthenticated() || !req.user) {
      throw new UnauthorizedException();
    }

    const user = req.user;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException(
          'You do not have the required role to access this resource',
        );
      }
    }

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = (user.permissions ?? []) as Permission[];
      const missingPermission = requiredPermissions.find(
        (p) => !userPermissions.includes(p),
      );
      if (missingPermission) {
        throw new ForbiddenException(
          'You do not have the required permissions to access this resource',
        );
      }
    }

    return true;
  }
}
