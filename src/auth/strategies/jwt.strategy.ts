import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import {
    ExtractJwt,
    Strategy,
} from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

interface JwtPayload {
    sub: string;
    username: string;
    role: 'ADMIN_BANK' | 'NASABAH';
}

@Injectable()
export class JwtStrategy
    extends PassportStrategy(
        Strategy,
        'jwt-user',
    )
{
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey:
                configService.get<string>(
                    'JWT_SECRET',
                )!,
        });
    }

    validate(payload: JwtPayload) {
        if (
            !payload.sub ||
            !payload.username ||
            !payload.role
        ) {
            throw new UnauthorizedException(
                'Token user tidak valid.',
            );
        }

        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role.toLowerCase(),
        };
    }
}