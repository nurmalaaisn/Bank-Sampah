import {
    Controller,
    Get,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { PrismaService } from './prisma/prisma.service';
import { ResponseMessage } from './common/decorators/response-message.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    @Get('health')
    @ApiOperation({
        summary: 'Memeriksa status server dan database',
    })
    @ApiResponse({
        status: 200,
        description: 'Server berjalan',
    })
    @ResponseMessage('Server berjalan')
    async health() {
        let dbStatus = 'disconnected';

        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = 'connected';
        } catch {
            dbStatus = 'disconnected';
        }

        return {
            server: 'ok',
            database: dbStatus,
            timestamp: new Date().toISOString(),
        };
    }
}