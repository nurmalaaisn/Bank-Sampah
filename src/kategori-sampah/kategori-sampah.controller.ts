import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { KategoriSampahService } from './kategori-sampah.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Kategori Sampah')
@Controller('kategori-sampah')
export class KategoriSampahController {
    constructor(
        private readonly kategoriSampahService: KategoriSampahService,
    ) {}

    @Get()
    @ApiOperation({
        summary: 'Melihat daftar kategori sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Daftar kategori sampah daur ulang berhasil diambil',
    })
    @ResponseMessage(
        'Daftar kategori sampah daur ulang berhasil diambil',
    )
    findAll() {
        return this.kategoriSampahService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Melihat detail kategori sampah',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID kategori sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Detail kategori sampah berhasil diambil',
    })
    @ApiResponse({
        status: 404,
        description: 'Data kategori tidak ditemukan',
    })
    @ResponseMessage(
        'Detail kategori sampah berhasil diambil',
    )
    findOne(@Param('id') id: string) {
        return this.kategoriSampahService.findOne(id);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [
                'namaKategori',
                'hargaPerKg',
                'poinPerKg',
                'jenis',
            ],
            properties: {
                namaKategori: {
                    type: 'string',
                    example: 'Botol Plastik',
                },
                hargaPerKg: {
                    type: 'number',
                    example: 3500,
                },
                poinPerKg: {
                    type: 'number',
                    example: 10,
                },
                jenis: {
                    type: 'string',
                    enum: [
                        'plastik',
                        'kertas',
                        'logam',
                        'kaca',
                    ],
                    example: 'plastik',
                },
                foto: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Foto kategori sampah yang akan disimpan di Cloudinary',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Menambahkan kategori sampah (Admin)',
    })
    @ApiResponse({
        status: 201,
        description:
            'Kategori sampah baru berhasil disimpan',
    })
    @ApiResponse({
        status: 400,
        description: 'Data tidak valid / data sudah ada',
    })
    @ApiResponse({
        status: 401,
        description: 'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Kategori sampah baru berhasil disimpan',
    )
    @UseInterceptors(
        FileInterceptor('foto'),
    )
    create(
        @Body() dto: CreateKategoriSampahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.kategoriSampahService.create(
            dto,
            file,
        );
    }

    @Put(':id')
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [
                'namaKategori',
                'hargaPerKg',
                'poinPerKg',
                'jenis',
            ],
            properties: {
                namaKategori: {
                    type: 'string',
                    example: 'Botol Plastik',
                },
                hargaPerKg: {
                    type: 'number',
                    example: 3500,
                },
                poinPerKg: {
                    type: 'number',
                    example: 10,
                },
                jenis: {
                    type: 'string',
                    enum: [
                        'plastik',
                        'kertas',
                        'logam',
                        'kaca',
                    ],
                    example: 'plastik',
                },
                foto: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Foto kategori sampah baru yang akan disimpan di Cloudinary',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Memperbarui kategori sampah (Admin)',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID kategori sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Kategori sampah berhasil diperbarui',
    })
    @ApiResponse({
        status: 401,
        description: 'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @ApiResponse({
        status: 404,
        description: 'Data kategori tidak ditemukan',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Kategori sampah berhasil diperbarui',
    )
    @UseInterceptors(
        FileInterceptor('foto'),
    )
    update(
        @Param('id') id: string,
        @Body() dto: UpdateKategoriSampahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.kategoriSampahService.update(
            id,
            dto,
            file,
        );
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Menghapus kategori sampah (Admin)',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID kategori sampah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Kategori sampah berhasil dihapus',
    })
    @ApiResponse({
        status: 401,
        description: 'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description: 'Akses hanya untuk admin bank',
    })
    @ApiResponse({
        status: 404,
        description: 'Data kategori tidak ditemukan',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Kategori sampah berhasil dihapus',
    )
    remove(@Param('id') id: string) {
        return this.kategoriSampahService.remove(id);
    }
}