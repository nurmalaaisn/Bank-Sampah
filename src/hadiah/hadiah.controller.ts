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
import { diskStorage } from 'multer';

import { HadiahService } from './hadiah.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Hadiah')
@Controller('hadiah')
export class HadiahController {
    constructor(
        private readonly hadiahService: HadiahService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Melihat daftar hadiah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Daftar barang/voucher hadiah berhasil diambil',
    })
    @ResponseMessage(
        'Daftar barang/voucher hadiah berhasil diambil',
    )
    findAll() {
        return this.hadiahService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Melihat detail hadiah',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID hadiah',
    })
    @ApiResponse({
        status: 200,
        description: 'Detail hadiah berhasil diambil',
    })
    @ApiResponse({
        status: 404,
        description: 'Data hadiah tidak ditemukan',
    })
    @ResponseMessage(
        'Detail hadiah berhasil diambil',
    )
    findOne(@Param('id') id: string) {
        return this.hadiahService.findOne(id);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [
                'namaHadiah',
                'poinDibutuhkan',
                'stok',
            ],
            properties: {
                namaHadiah: {
                    type: 'string',
                    example: 'Voucher Belanja Rp50.000',
                },
                poinDibutuhkan: {
                    type: 'integer',
                    example: 500,
                },
                stok: {
                    type: 'integer',
                    example: 10,
                },
                foto: {
                    type: 'string',
                    format: 'binary',
                    description: 'Foto hadiah',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Menambahkan hadiah baru (Admin)',
    })
    @ApiResponse({
        status: 201,
        description: 'Hadiah baru berhasil ditambahkan',
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
        'Hadiah baru berhasil ditambahkan',
    )
    @UseInterceptors(
        FileInterceptor('foto', {
            storage: diskStorage({
                destination: './uploads',
            }),
        }),
    )
    create(
        @Body() dto: CreateHadiahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.hadiahService.create(
            dto,
            file?.filename,
        );
    }

    @Put(':id')
    @ApiBearerAuth('access-token')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [
                'namaHadiah',
                'poinDibutuhkan',
                'stok',
            ],
            properties: {
                namaHadiah: {
                    type: 'string',
                    example: 'Voucher Belanja Rp50.000',
                },
                poinDibutuhkan: {
                    type: 'integer',
                    example: 500,
                },
                stok: {
                    type: 'integer',
                    example: 10,
                },
                foto: {
                    type: 'string',
                    format: 'binary',
                    description: 'Foto hadiah',
                },
            },
        },
    })
    @ApiOperation({
        summary: 'Memperbarui hadiah (Admin)',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID hadiah',
    })
    @ApiResponse({
        status: 200,
        description: 'Data hadiah berhasil diperbarui',
    })
    @ApiResponse({
        status: 400,
        description: 'Data tidak valid',
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
        description: 'Data hadiah tidak ditemukan',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Data hadiah berhasil diperbarui',
    )
    @UseInterceptors(
        FileInterceptor('foto', {
            storage: diskStorage({
                destination: './uploads',
            }),
        }),
    )
    update(
        @Param('id') id: string,
        @Body() dto: UpdateHadiahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.hadiahService.update(
            id,
            dto,
            file?.filename,
        );
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Menghapus hadiah (Admin)',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID hadiah',
    })
    @ApiResponse({
        status: 200,
        description: 'Hadiah berhasil dihapus',
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
        description: 'Data hadiah tidak ditemukan',
    })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin_bank')
    @ResponseMessage(
        'Hadiah berhasil dihapus',
    )
    remove(@Param('id') id: string) {
        return this.hadiahService.remove(id);
    }
}