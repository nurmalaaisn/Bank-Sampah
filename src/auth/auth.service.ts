import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterNasabahDto } from './dto/register-nasabah.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async registerNasabah(
        dto: RegisterNasabahDto,
        foto?: string,
    ) {
        const existingUser =
            await this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                },
            });

        if (existingUser) {
            throw new BadRequestException(
                'Username sudah digunakan.',
            );
        }

        const hashedPassword =
            await bcrypt.hash(dto.password, 10);

        const user =
            await this.prisma.$transaction(
                async (tx) => {
                    const newUser =
                        await tx.user.create({
                            data: {
                                username: dto.username,
                                password: hashedPassword,
                                role: 'nasabah',
                                nasabah: {
                                    create: {
                                        namaNasabah:
                                            dto.namaNasabah,
                                        alamat:
                                            dto.alamat,
                                        telp:
                                            dto.telp,
                                        foto,
                                    },
                                },
                            },
                            include: {
                                nasabah: true,
                            },
                        });

                    return newUser;
                },
            );

        return {
            id: user.id,
            username: user.username,
            role: user.role.toUpperCase(),
            nasabah: {
                id: user.nasabah?.id,
                namaNasabah:
                    user.nasabah?.namaNasabah,
                alamat:
                    user.nasabah?.alamat,
                telp:
                    user.nasabah?.telp,
                saldoPoin:
                    user.nasabah?.saldoPoin,
                foto:
                    user.nasabah?.foto,
            },
        };
    }

    async registerAdmin(
        dto: RegisterAdminDto,
    ) {
        const existingUser =
            await this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                },
            });

        if (existingUser) {
            throw new BadRequestException(
                'Username sudah digunakan.',
            );
        }

        const hashedPassword =
            await bcrypt.hash(dto.password, 10);

        const user =
            await this.prisma.$transaction(
                async (tx) => {
                    const newUser =
                        await tx.user.create({
                            data: {
                                username: dto.username,
                                password: hashedPassword,
                                role: 'admin_bank',
                                adminBank: {
                                    create: {
                                        namaUnit:
                                            dto.namaUnit,
                                        namaPengelola:
                                            dto.namaPengelola,
                                        telp:
                                            dto.telp,
                                    },
                                },
                            },
                            include: {
                                adminBank: true,
                            },
                        });

                    return newUser;
                },
            );

        return {
            id: user.id,
            username: user.username,
            role: user.role.toUpperCase(),
            adminBank: {
                id: user.adminBank?.id,
                namaUnit:
                    user.adminBank?.namaUnit,
                namaPengelola:
                    user.adminBank?.namaPengelola,
                telp:
                    user.adminBank?.telp,
            },
        };
    }

    async login(dto: LoginUserDto) {
        const user =
            await this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                },
                include: {
                    nasabah: true,
                    adminBank: true,
                },
            });

        if (!user) {
            throw new UnauthorizedException(
                'Username atau password salah.',
            );
        }

        const passwordMatch =
            await bcrypt.compare(
                dto.password,
                user.password,
            );

        if (!passwordMatch) {
            throw new UnauthorizedException(
                'Username atau password salah.',
            );
        }

        const token =
            this.jwtService.sign({
                sub: user.id,
                username: user.username,
                role: user.role.toUpperCase(),
            });

        return {
            id: user.id,
            username: user.username,
            role: user.role.toUpperCase(),

            nasabah: user.nasabah
                ? {
                    id: user.nasabah.id,
                    namaNasabah:
                        user.nasabah.namaNasabah,
                    alamat:
                        user.nasabah.alamat,
                    telp:
                        user.nasabah.telp,
                    saldoPoin:
                        user.nasabah.saldoPoin,
                    foto:
                        user.nasabah.foto,
                }
                : null,

            adminBank: user.adminBank
                ? {
                    id: user.adminBank.id,
                    namaUnit:
                        user.adminBank.namaUnit,
                    namaPengelola:
                        user.adminBank.namaPengelola,
                    telp:
                        user.adminBank.telp,
                }
                : null,

            token,
        };
    }

    async getMe(userId: string) {
        const user =
            await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    nasabah: true,
                    adminBank: true,
                },
            });

        if (!user) {
            throw new UnauthorizedException(
                'User tidak ditemukan.',
            );
        }

        return {
            id: user.id,
            username: user.username,
            role: user.role.toUpperCase(),

            nasabah: user.nasabah
                ? {
                    id: user.nasabah.id,
                    namaNasabah:
                        user.nasabah.namaNasabah,
                    alamat:
                        user.nasabah.alamat,
                    telp:
                        user.nasabah.telp,
                    saldoPoin:
                        user.nasabah.saldoPoin,
                    foto:
                        user.nasabah.foto,
                }
                : null,

            adminBank: user.adminBank
                ? {
                    id: user.adminBank.id,
                    namaUnit:
                        user.adminBank.namaUnit,
                    namaPengelola:
                        user.adminBank.namaPengelola,
                    telp:
                        user.adminBank.telp,
                }
                : null,
        };
    }
}