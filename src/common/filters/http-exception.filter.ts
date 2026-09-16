import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter
    implements ExceptionFilter {
    catch(
        exception: unknown,
        host: ArgumentsHost,
    ) {
        const ctx = host.switchToHttp();
        const response =
            ctx.getResponse<Response>();

        let statusCode =
            HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string | string[] =
            'Terjadi kesalahan pada server.';

        let errors: unknown = null;

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();

            const exceptionResponse =
                exception.getResponse();

            if (
                typeof exceptionResponse ===
                'string'
            ) {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse ===
                'object' &&
                exceptionResponse !== null
            ) {
                const responseData =
                    exceptionResponse as {
                        message?: string | string[];
                        errors?: unknown;
                    };

                if (
                    responseData.message !==
                    undefined
                ) {
                    message =
                        responseData.message;
                }

                if (
                    responseData.errors !==
                    undefined
                ) {
                    errors =
                        responseData.errors;
                }
            }
        } else {
            console.error(
                'Unhandled Exception:',
                exception,
            );
        }

        response.status(statusCode).json({
            statusCode,
            success: false,
            message,
            errors,
            timestamp:
                new Date().toISOString(),
        });
    }
}