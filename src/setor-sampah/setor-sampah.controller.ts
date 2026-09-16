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

import { SetorSampahService } from './setor-sampah.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Setor Sampah')
@ApiBearerAuth('access-token')
@Controller('setor-sampah')
@UseGuards(JwtAuthGuard)
export class SetorSampahController {
    constructor(
        private readonly setorSampahService: SetorSampahService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('pengajuan')
    @ApiOperation({
        summary:
            'Membuat pengajuan penyetoran sampah',
    })
    @ApiResponse({
        status: 201,
        description:
            'Pengajuan penyetoran sampah berhasil dibuat',
    })
    @ApiResponse({
        status: 400,
        description: 'Data pengajuan tidak valid',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk nasabah',
    })
    @UseGuards(RolesGuard)
    @Roles('nasabah')
    @ResponseMessage(
        'Pengajuan penyetoran sampah berhasil dibuat',
    )
    @ApiBody({
        schema: {
            type: 'object',
            required: ['tanggal', 'items'],
            properties: {
                tanggal: {
                    type: 'string',
                    format: 'date',
                    example: '2026-09-15',
                },
                catatan: {
                    type: 'string',
                    example: 'Sampah sudah dipilah',
                },
                items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'object',
                        required: [
                            'kategoriSampahId',
                            'beratKg',
                        ],
                        properties: {
                            kategoriSampahId: {
                                type: 'string',
                                format: 'uuid',
                                example:
                                    '550e8400-e29b-41d4-a716-446655440000',
                            },
                            beratKg: {
                                type: 'number',
                                example: 5.5,
                            },
                        },
                    },
                },
            },
        },
    })
    async pengajuan(
        @Body() dto: CreateSetorSampahDto,
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

        return this.setorSampahService.pengajuan(
            dto,
            nasabah.id,
        );
    }

    @Get('my-setor')
    @ApiOperation({
        summary:
            'Melihat histori pengajuan penyetoran sampah',
    })
    @ApiQuery({
        name: 'bulan',
        required: false,
        example: '2026-09',
        description:
            'Filter pengajuan berdasarkan bulan',
    })
    @ApiResponse({
        status: 200,
        description:
            'Histori pengajuan penyetoran sampah berhasil diambil',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk nasabah',
    })
    @UseGuards(RolesGuard)
    @Roles('nasabah')
    @ResponseMessage(
        'Histori pengajuan penyetoran sampah berhasil diambil',
    )
    async myList(
        @CurrentUser()
        user: {
            userId: string;
        },
        @Query('bulan') bulan?: string,
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

        return this.setorSampahService.myList(
            nasabah.id,
            bulan,
        );
    }

    @Get('admin/list')
    @ApiOperation({
        summary:
            'Melihat seluruh pengajuan penyetoran sampah',
    })
    @ApiQuery({
        name: 'status',
        required: false,
        example: 'menunggu_konfirmasi',
        description:
            'Filter berdasarkan status pengajuan',
    })
    @ApiQuery({
        name: 'bulan',
        required: false,
        example: '2026-09',
        description:
            'Filter berdasarkan bulan',
    })
    @ApiResponse({
        status: 200,
        description:
            'Seluruh data pengajuan penyetoran sampah berhasil diambil',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @UseGuards(RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Seluruh data pengajuan penyetoran sampah berhasil diambil',
    )
    adminList(
        @Query('status') status?: string,
        @Query('bulan') bulan?: string,
    ) {
        return this.setorSampahService.adminList(
            status,
            bulan,
        );
    }

    @Put('admin/verify/:id')
    @ApiOperation({
        summary:
            'Memverifikasi penyetoran sampah (Admin)',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID transaksi setor sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Verifikasi penyetoran sampah berhasil disimpan dan poin nasabah telah diperbarui',
    })
    @ApiResponse({
        status: 400,
        description:
            'Transaksi sudah diverifikasi sebelumnya atau data tidak valid',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @ApiResponse({
        status: 404,
        description: 'Data transaksi tidak ditemukan',
    })
    @UseGuards(RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Verifikasi penyetoran sampah berhasil disimpan dan poin nasabah telah diperbarui',
    )
    @ApiBody({
        schema: {
            type: 'object',
            required: ['status'],
            properties: {
                status: {
                    type: 'string',
                    enum: [
                        'diverifikasi',
                        'selesai',
                        'ditolak',
                    ],
                    example: 'selesai',
                },
                catatanAdmin: {
                    type: 'string',
                    example:
                        'Berat sampah telah dikonfirmasi.',
                },
                itemsReal: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: [
                            'kategoriSampahId',
                            'beratKgReal',
                        ],
                        properties: {
                            kategoriSampahId: {
                                type: 'string',
                                format: 'uuid',
                                example:
                                    '550e8400-e29b-41d4-a716-446655440000',
                            },
                            beratKgReal: {
                                type: 'number',
                                example: 5.2,
                            },
                        },
                    },
                },
            },
        },
    })
    async verify(
        @Param('id') id: string,
        @Body() dto: VerifySetorSampahDto,
        @CurrentUser()
        user: {
            userId: string;
        },
    ) {
        const adminBank =
            await this.prisma.adminBank.findUnique({
                where: {
                    idUser: user.userId,
                },
            });

        if (!adminBank) {
            throw new ForbiddenException(
                'Data admin bank tidak ditemukan.',
            );
        }

        return this.setorSampahService.verify(
            id,
            dto,
            adminBank.id,
        );
    }

    @Get(':id')
    @ApiOperation({
        summary:
            'Melihat detail transaksi penyetoran sampah',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID transaksi setor sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Detail transaksi penyetoran sampah berhasil diambil',
    })
    @ApiResponse({
        status: 403,
        description:
            'Tidak memiliki akses ke transaksi tersebut',
    })
    @ApiResponse({
        status: 404,
        description: 'Data transaksi tidak ditemukan',
    })
    @ResponseMessage(
        'Detail transaksi penyetoran sampah berhasil diambil',
    )
    findOne(
        @Param('id') id: string,
        @CurrentUser()
        user: {
            userId: string;
            role: string;
        },
    ) {
        return this.setorSampahService.findOne(
            id,
            user,
        );
    }
}