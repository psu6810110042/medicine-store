import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<ExpressRequest>();
        return request.isAuthenticated ? request.isAuthenticated() : false;
    }
}
