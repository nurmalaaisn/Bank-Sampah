import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Jika endpoint tidak memiliki @Roles(...),
        // maka semua role yang sudah login diperbolehkan.
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException(
                'User tidak terautentikasi.',
            );
        }

        const hasRole = requiredRoles.some(
            (role) => role.toLowerCase() === user.role?.toLowerCase(),
        );

        if (!hasRole) {
            throw new ForbiddenException(
                'Anda tidak memiliki akses untuk endpoint ini.',
            );
        }

        return true;
    }
}