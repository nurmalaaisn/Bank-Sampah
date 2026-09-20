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

import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';

import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Admin Nasabah')
@ApiBearerAuth('access-token')
@Controller('admin/nasabah')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_bank')
export class NasabahController {
    constructor(
        private readonly nasabahService: NasabahService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Melihat daftar nasabah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Daftar nasabah berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ApiResponse({
        status: 403,
        description:
            'Akses hanya untuk admin bank',
    })
    @ResponseMessage(
        'Daftar nasabah berhasil diambil',
    )
    findAll() {
        return this.nasabahService.findAll();
    }

    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [
                'username',
                'password',
                'namaNasabah',
                'alamat',
                'telp',
            ],
            properties: {
                username: {
                    type: 'string',
                    example: 'nasabah02',
                },
                password: {
                    type: 'string',
                    example: 'nasabah123',
                },
                namaNasabah: {
                    type: 'string',
                    example: 'Siti Aminah',
                },
                alamat: {
                    type: 'string',
                    example:
                        'Jl. Kenanga No. 5, Malang',
                },
                telp: {
                    type: 'string',
                    example: '081298765432',
                },
                foto: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Foto nasabah yang akan disimpan di Cloudinary',
                },
            },
        },
    })
    @ApiOperation({
        summary:
            'Menambahkan nasabah baru',
    })
    @ApiResponse({
        status: 201,
        description:
            'Nasabah baru berhasil ditambahkan',
    })
    @ApiResponse({
        status: 400,
        description:
            'Data tidak valid / username sudah digunakan',
    })
    @UseInterceptors(
        FileInterceptor('foto'),
    )
    @ResponseMessage(
        'Nasabah baru berhasil ditambahkan',
    )
    create(
        @Body() dto: CreateNasabahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.nasabahService.create(
            dto,
            file,
        );
    }

    @Get(':id')
    @ApiOperation({
        summary:
            'Melihat detail nasabah',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID nasabah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Detail nasabah berhasil diambil',
    })
    @ApiResponse({
        status: 404,
        description:
            'Nasabah tidak ditemukan',
    })
    @ResponseMessage(
        'Detail nasabah berhasil diambil',
    )
    findOne(
        @Param('id') id: string,
    ) {
        return this.nasabahService.findOne(id);
    }

    @Put(':id')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: [
                'namaNasabah',
                'alamat',
                'telp',
            ],
            properties: {
                namaNasabah: {
                    type: 'string',
                    example: 'Siti Aminah',
                },
                alamat: {
                    type: 'string',
                    example:
                        'Jl. Kenanga No. 5, Malang',
                },
                telp: {
                    type: 'string',
                    example: '081298765432',
                },
                foto: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Foto nasabah baru yang akan disimpan di Cloudinary',
                },
            },
        },
    })
    @ApiOperation({
        summary:
            'Memperbarui data nasabah',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID nasabah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Data nasabah berhasil diperbarui',
    })
    @ApiResponse({
        status: 404,
        description:
            'Nasabah tidak ditemukan',
    })
    @UseInterceptors(
        FileInterceptor('foto'),
    )
    @ResponseMessage(
        'Data nasabah berhasil diperbarui',
    )
    update(
        @Param('id') id: string,
        @Body() dto: UpdateNasabahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.nasabahService.update(
            id,
            dto,
            file,
        );
    }

    @Delete(':id')
    @ApiOperation({
        summary:
            'Menghapus data nasabah',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID nasabah',
    })
    @ApiResponse({
        status: 200,
        description:
            'Data nasabah berhasil dihapus',
    })
    @ApiResponse({
        status: 404,
        description:
            'Nasabah tidak ditemukan',
    })
    @ResponseMessage(
        'Data nasabah berhasil dihapus',
    )
    remove(
        @Param('id') id: string,
    ) {
        return this.nasabahService.remove(id);
    }
}