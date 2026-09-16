import {
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { SeedService } from './seed.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Seed')
@ApiBearerAuth('access-token')
@Controller('seed')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_bank')
export class SeedController {
    constructor(
        private readonly seedService: SeedService,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Membuat dummy sample data Bank Sampah',
    })
    @ApiResponse({
        status: 201,
        description:
            'Dummy sample data Bank Sampah berhasil dibuat!',
    })
    @ApiResponse({
        status: 401,
        description: 'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @ResponseMessage(
        'Dummy sample data Bank Sampah berhasil dibuat!',
    )
    seed() {
        return this.seedService.seed();
    }
}