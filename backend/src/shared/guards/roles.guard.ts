import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('User not found');
    }

    const hasRole = requiredRoles.includes((user?.role ?? '') as string);

    if (!hasRole) {
      this.logger.warn(`User ${user.id} attempted to access resource with insufficient role`);
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
