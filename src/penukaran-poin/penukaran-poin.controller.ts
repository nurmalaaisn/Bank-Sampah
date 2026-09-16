import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { PenukaranPoinService } from './penukaran-poin.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Penukaran Poin')
@ApiBearerAuth('access-token')
@Controller('penukaran-poin')
@UseGuards(JwtAuthGuard)
export class PenukaranPoinController {
    constructor(
        private readonly penukaranPoinService: PenukaranPoinService,
        private readonly prisma: PrismaService,
    ) {}

    @Post('tukar')
    @ApiOperation({
        summary: 'Mengajukan penukaran poin',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['hadiahId'],
            properties: {
                hadiahId: {
                    type: 'string',
                    format: 'uuid',
                    example:
                        '550e8400-e29b-41d4-a716-446655440000',
                    description:
                        'ID hadiah yang ingin ditukar',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description:
            'Penukaran poin berhasil diajukan',
    })
    @ApiResponse({
        status: 400,
        description:
            'Saldo poin atau stok hadiah tidak mencukupi',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk nasabah',
    })
    @ApiResponse({
        status: 404,
        description:
            'Hadiah atau data nasabah tidak ditemukan',
    })
    @UseGuards(RolesGuard)
    @Roles('nasabah')
    @ResponseMessage(
        'Penukaran poin berhasil diajukan',
    )
    async tukar(
        @Body() dto: CreatePenukaranPoinDto,
        @CurrentUser()
        user: {
            userId: string;
            role: string;
        },
    ) {
        const nasabah =
            await this.prisma.nasabah.findUnique({
                where: {
                    idUser: user.userId,
                },
            });

        if (!nasabah) {
            throw new ForbiddenException(
                'Data nasabah tidak ditemukan.',
            );
        }

        return this.penukaranPoinService.tukar(
            dto,
            nasabah.id,
        );
    }

    @Get('my-penukaran')
    @ApiOperation({
        summary:
            'Melihat histori penukaran poin nasabah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Histori penukaran poin nasabah berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk nasabah',
    })
    @ApiResponse({
        status: 404,
        description:
            'Data nasabah tidak ditemukan',
    })
    @UseGuards(RolesGuard)
    @Roles('nasabah')
    @ResponseMessage(
        'Histori penukaran poin nasabah berhasil diambil',
    )
    async myList(
        @CurrentUser()
        user: {
            userId: string;
        },
    ) {
        const nasabah =
            await this.prisma.nasabah.findUnique({
                where: {
                    idUser: user.userId,
                },
            });

        if (!nasabah) {
            throw new ForbiddenException(
                'Data nasabah tidak ditemukan.',
            );
        }

        return this.penukaranPoinService.myList(
            nasabah.id,
        );
    }

    @Get('admin/list')
    @ApiOperation({
        summary:
            'Melihat seluruh transaksi penukaran poin',
    })
    @ApiQuery({
        name: 'bulan',
        required: false,
        example: '2026-09',
        description:
            'Filter transaksi berdasarkan bulan dengan format YYYY-MM',
    })
    @ApiResponse({
        status: 200,
        description:
            'Seluruh data transaksi penukaran poin berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @UseGuards(RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Seluruh data transaksi penukaran poin berhasil diambil',
    )
    adminList(
        @Query('bulan') bulan?: string,
    ) {
        return this.penukaranPoinService.adminList(
            bulan,
        );
    }

    @Put('admin/status/:id')
    @ApiOperation({
        summary:
            'Memperbarui status transaksi penukaran poin',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID transaksi penukaran',
        example:
            '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: {
                    type: 'string',
                    enum: ['diproses', 'selesai'],
                    example: 'diproses',
                    description:
                        'Status baru transaksi penukaran',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description:
            'Status transaksi penukaran poin berhasil diperbarui',
    })
    @ApiResponse({
        status: 400,
        description:
            'Status transaksi tidak valid atau transaksi sudah selesai',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @ApiResponse({
        status: 404,
        description:
            'Transaksi penukaran tidak ditemukan',
    })
    @UseGuards(RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Status transaksi penukaran poin berhasil diperbarui',
    )
    updateStatus(
        @Param('id') id: string,
        @Body()
        dto: UpdateStatusPenukaranDto,
    ) {
        return this.penukaranPoinService.updateStatus(
            id,
            dto.status,
        );
    }

    @Get('nota/:id')
    @ApiOperation({
        summary: 'Melihat nota penukaran poin',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID transaksi penukaran',
        example:
            '550e8400-e29b-41d4-a716-446655440000',
    })
    @ApiResponse({
        status: 200,
        description:
            'Struk nota penukaran poin berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description:
            'Tidak memiliki akses ke transaksi tersebut',
    })
    @ApiResponse({
        status: 404,
        description:
            'Transaksi penukaran tidak ditemukan',
    })
    @ResponseMessage(
        'Struk nota penukaran poin berhasil diambil',
    )
    getNota(
        @Param('id') id: string,
        @CurrentUser()
        user: {
            userId: string;
            role: string;
        },
    ) {
        return this.penukaranPoinService.getNota(
            id,
            user,
        );
    }
}