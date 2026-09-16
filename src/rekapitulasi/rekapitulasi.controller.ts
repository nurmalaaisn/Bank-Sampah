import {
    Controller,
    Get,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { Response } from 'express';

import { RekapitulasiService } from './rekapitulasi.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Rekapitulasi')
@ApiBearerAuth('access-token')
@Controller('rekapitulasi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_bank')
export class RekapitulasiController {
    constructor(
        private readonly rekapitulasiService: RekapitulasiService,
    ) {}

    @Get('bulanan')
    @ApiOperation({
        summary: 'Melihat rekapitulasi Bank Sampah bulanan',
    })
    @ApiQuery({
        name: 'bulan',
        required: true,
        example: '2026-09',
        description:
            'Periode rekapitulasi dengan format YYYY-MM',
    })
    @ApiResponse({
        status: 200,
        description:
            'Rekapitulasi Bank Sampah Bulan 9/2026 berhasil diambil',
    })
    @ApiResponse({
        status: 400,
        description:
            'Parameter bulan wajib diisi dengan format YYYY-MM.',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    async bulanan(
        @Query('bulan') bulan: string | undefined,
        @Res({ passthrough: true })
        response: Response,
    ) {
        const data =
            await this.rekapitulasiService.bulanan(
                bulan,
            );

        const [tahun, bulanAngka] =
            data.periode.split('-');

        response.locals.responseMessage =
            `Rekapitulasi Bank Sampah Bulan ${Number(
                bulanAngka,
            )}/${tahun} berhasil diambil`;

        return data;
    }
}