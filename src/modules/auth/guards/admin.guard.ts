import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '@/modules/users/entity/user.role';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.isAuthenticated()) throw new UnauthorizedException();
    if (req.user?.role !== UserRole.OWNER) throw new ForbiddenException();
    return true;
  }
}
