import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomErrors } from '../constants/custom-errors';
import { IJwtPayload, RoleType } from '../../interfaces';
import { ROLES_KEY } from '../constants/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: IJwtPayload = request?.user;

    const hasRole = requiredRoles.some((role) => user.role.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(CustomErrors.ACCESS_DENIED);
    }

    return hasRole;
  }
}
