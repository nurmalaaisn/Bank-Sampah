import {
    Body,
    Controller,
    Get,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { AuthService } from './auth.service';
import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { LoginResponseInterceptor } from '../common/interceptors/login-response.interceptor';
import { imageUploadOptions } from '../common/multer/image-upload.config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('nasabah/register')
    @ApiOperation({
        summary: 'Registrasi nasabah',
    })
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
                    example: 'nasabah01',
                },
                password: {
                    type: 'string',
                    example: 'nasabah123',
                },
                namaNasabah: {
                    type: 'string',
                    example: 'Budi Santoso',
                },
                alamat: {
                    type: 'string',
                    example:
                        'Jl. Mawar No. 10, Malang',
                },
                telp: {
                    type: 'string',
                    example: '081234567890',
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
    @ApiResponse({
        status: 201,
        description:
            'Registrasi nasabah berhasil',
    })
    @ApiResponse({
        status: 400,
        description:
            'Data registrasi tidak valid / username sudah digunakan',
    })
    @ResponseMessage(
        'Registrasi nasabah berhasil',
    )
    @UseInterceptors(
        FileInterceptor('foto', imageUploadOptions),
    )
    registerNasabah(
        @Body() dto: RegisterNasabahDto,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        return this.authService.registerNasabah(
            dto,
            file,
        );
    }

    @Post('admin/register')
    @ApiOperation({
        summary:
            'Registrasi unit Bank Sampah',
    })
    @ApiResponse({
        status: 201,
        description:
            'Pendaftaran unit Bank Sampah berhasil',
    })
    @ApiResponse({
        status: 400,
        description:
            'Data registrasi tidak valid',
    })
    @ResponseMessage(
        'Pendaftaran unit Bank Sampah berhasil',
    )
    registerAdmin(
        @Body() dto: RegisterAdminDto,
    ) {
        return this.authService.registerAdmin(
            dto,
        );
    }

    @Post('login')
    @ApiOperation({
        summary: 'Login user',
    })
    @ApiResponse({
        status: 200,
        description: 'Login berhasil',
    })
    @ApiResponse({
        status: 401,
        description:
            'Username atau password salah',
    })
    @UseInterceptors(
        LoginResponseInterceptor,
    )
    login(
        @Body() dto: LoginUserDto,
    ) {
        return this.authService.login(dto);
    }

    @Get('me')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary:
            'Mengambil profile user yang sedang login',
    })
    @ApiResponse({
        status: 200,
        description:
            'Data profile user berhasil diambil',
    })
    @ApiResponse({
        status: 401,
        description:
            'Token tidak valid atau tidak ada',
    })
    @ResponseMessage(
        'Data profile user berhasil diambil',
    )
    @UseGuards(JwtAuthGuard)
    getMe(
        @CurrentUser()
        user: {
            userId: string;
            role: 'admin_bank' | 'nasabah';
        },
    ) {
        return this.authService.getMe(
            user.userId,
        );
    }
}