import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) {}

    @Get('summary')
    @ApiOperation({
        summary: 'Melihat summary dashboard nasabah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Summary dashboard nasabah berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description: 'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk nasabah',
    })
    @UseGuards(RolesGuard)
    @Roles('nasabah')
    @ResponseMessage(
        'Summary dashboard nasabah berhasil diambil',
    )
    summary(
        @CurrentUser()
        user: {
            userId: string;
            role: string;
        },
    ) {
        return this.dashboardService.summary(
            user.userId,
        );
    }

    @Get('stats')
    @ApiOperation({
        summary: 'Melihat statistik dashboard Bank Sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Statistik dashboard Bank Sampah berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description: 'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @UseGuards(RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Statistik dashboard Bank Sampah berhasil diambil',
    )
    stats() {
        return this.dashboardService.stats();
    }
}