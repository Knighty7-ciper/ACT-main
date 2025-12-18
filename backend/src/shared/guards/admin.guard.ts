import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('User not found');
    }

    if (user.role !== 'admin') {
      this.logger.warn(`Non-admin user ${user.id} attempted admin access`);
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
