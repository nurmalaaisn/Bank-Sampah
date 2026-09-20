import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';

@Injectable()
export class NasabahService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async findAll() {
        const nasabahList =
            await this.prisma.nasabah.findMany({
                where: {
                    user: {
                        role: 'nasabah',
                    },
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    id: 'asc',
                },
            });

        return nasabahList.map((nasabah) => ({
            id: nasabah.id,
            namaNasabah: nasabah.namaNasabah,
            alamat: nasabah.alamat,
            telp: nasabah.telp,
            saldoPoin: nasabah.saldoPoin,
            foto: nasabah.foto,
            user: {
                username:
                    nasabah.user.username,
                role:
                    nasabah.user.role.toUpperCase(),
            },
        }));
    }

    async create(
        dto: CreateNasabahDto,
        file?: Express.Multer.File,
    ) {
        const existingUser =
            await this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                },
            });

        if (existingUser) {
            throw new BadRequestException(
                'Username sudah digunakan pada database aplikasi Anda.',
            );
        }

        const hashedPassword =
            await bcrypt.hash(dto.password, 10);

        let foto: string | null = null;

        if (file) {
            const uploaded =
                await this.cloudinaryService.uploadImage(
                    file,
                    'bank-sampah/nasabah',
                );

            foto = uploaded.secure_url;
        }

        return this.prisma.$transaction(
            async (tx) => {
                const user =
                    await tx.user.create({
                        data: {
                            username: dto.username,
                            password: hashedPassword,
                            role: 'nasabah',
                        },
                    });

                const nasabah =
                    await tx.nasabah.create({
                        data: {
                            namaNasabah:
                                dto.namaNasabah,
                            alamat: dto.alamat,
                            telp: dto.telp,
                            foto,
                            idUser: user.id,
                        },
                    });

                return {
                    id: nasabah.id,
                    namaNasabah:
                        nasabah.namaNasabah,
                    alamat: nasabah.alamat,
                    telp: nasabah.telp,
                    saldoPoin:
                        nasabah.saldoPoin,
                    foto: nasabah.foto,
                    user: {
                        username:
                            user.username,
                        role:
                            user.role.toUpperCase(),
                    },
                };
            },
        );
    }

    async findOne(id: string) {
        const nasabah =
            await this.prisma.nasabah.findFirst({
                where: {
                    id,
                    user: {
                        role: 'nasabah',
                    },
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            role: true,
                        },
                    },
                },
            });

        if (!nasabah) {
            throw new NotFoundException(
                'Nasabah tidak ditemukan.',
            );
        }

        return {
            id: nasabah.id,
            namaNasabah:
                nasabah.namaNasabah,
            alamat: nasabah.alamat,
            telp: nasabah.telp,
            saldoPoin:
                nasabah.saldoPoin,
            foto: nasabah.foto,
            user: {
                username:
                    nasabah.user.username,
                role:
                    nasabah.user.role.toUpperCase(),
            },
            createdAt:
                nasabah.createdAt,
        };
    }

    async update(
        id: string,
        dto: UpdateNasabahDto,
        file?: Express.Multer.File,
    ) {
        const nasabah =
            await this.prisma.nasabah.findFirst({
                where: {
                    id,
                    user: {
                        role: 'nasabah',
                    },
                },
            });

        if (!nasabah) {
            throw new NotFoundException(
                'Nasabah tidak ditemukan.',
            );
        }

        let foto: string | undefined =
            undefined;

        if (file) {
            const uploaded =
                await this.cloudinaryService.uploadImage(
                    file,
                    'bank-sampah/nasabah',
                );

            foto = uploaded.secure_url;
        }

        const updatedNasabah =
            await this.prisma.nasabah.update({
                where: {
                    id: nasabah.id,
                },
                data: {
                    namaNasabah:
                        dto.namaNasabah,
                    alamat: dto.alamat,
                    telp: dto.telp,
                    ...(foto !== undefined
                        ? { foto }
                        : {}),
                },
            });

        return {
            id: updatedNasabah.id,
            namaNasabah:
                updatedNasabah.namaNasabah,
            alamat:
                updatedNasabah.alamat,
            telp:
                updatedNasabah.telp,
            saldoPoin:
                updatedNasabah.saldoPoin,
            foto:
                updatedNasabah.foto,
        };
    }

    async remove(id: string) {
        const nasabah =
            await this.prisma.nasabah.findFirst({
                where: {
                    id,
                    user: {
                        role: 'nasabah',
                    },
                },
                select: {
                    id: true,
                    idUser: true,
                },
            });

        if (!nasabah) {
            throw new NotFoundException(
                'Nasabah tidak ditemukan.',
            );
        }

        await this.prisma.$transaction(
            async (tx) => {
                await tx.nasabah.delete({
                    where: {
                        id: nasabah.id,
                    },
                });

                await tx.user.delete({
                    where: {
                        id: nasabah.idUser,
                    },
                });
            },
        );

        return {
            id: nasabah.id,
        };
    }
}