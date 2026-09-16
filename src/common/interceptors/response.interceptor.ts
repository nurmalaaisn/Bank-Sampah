import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor
    implements NestInterceptor
{
    private readonly reflector =
        new Reflector();

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const response =
            context.switchToHttp().getResponse();

        const defaultMessage =
            this.reflector.getAllAndOverride<string>(
                RESPONSE_MESSAGE_KEY,
                [
                    context.getHandler(),
                    context.getClass(),
                ],
            ) ?? 'Request berhasil.';

        return next.handle().pipe(
            map((data) => {
                if (
                    data?.__loginResponse === true
                ) {
                    return data.response;
                }

                const dynamicMessage =
                    response.locals
                        ?.responseMessage;

                const message =
                    dynamicMessage ??
                    defaultMessage;

                return {
                    statusCode:
                        response.statusCode,
                    success: true,
                    message,
                    data,
                };
            }),
        );
    }
}