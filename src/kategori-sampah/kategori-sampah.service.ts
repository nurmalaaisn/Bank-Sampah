import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

@Injectable()
export class KategoriSampahService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    private isValidUuid(id: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
        );
    }

    async findAll() {
        const kategoriList =
            await this.prisma.kategoriSampah.findMany({
                orderBy: {
                    namaKategori: 'asc',
                },
            });

        return kategoriList.map((kategori) => ({
            id: kategori.id,
            namaKategori: kategori.namaKategori,
            hargaPerKg: kategori.hargaPerKg,
            poinPerKg: kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        }));
    }

    async create(
        dto: CreateKategoriSampahDto,
        file?: Express.Multer.File,
    ) {
        const existing =
            await this.prisma.kategoriSampah.findFirst({
                where: {
                    namaKategori:
                        dto.namaKategori,
                },
            });

        if (existing) {
            throw new BadRequestException(
                'data sudah ada',
            );
        }

        let foto: string | null = null;

        if (file) {
            const uploaded =
                await this.cloudinaryService.uploadImage(
                    file,
                    'bank-sampah/kategori-sampah',
                );

            foto = uploaded.secure_url;
        }

        const kategori =
            await this.prisma.kategoriSampah.create({
                data: {
                    namaKategori:
                        dto.namaKategori,
                    hargaPerKg:
                        dto.hargaPerKg,
                    poinPerKg:
                        dto.poinPerKg,
                    jenis: dto.jenis as
                        | 'plastik'
                        | 'kertas'
                        | 'logam'
                        | 'kaca',
                    foto,
                },
            });

        return {
            id: kategori.id,
            namaKategori:
                kategori.namaKategori,
            hargaPerKg:
                kategori.hargaPerKg,
            poinPerKg:
                kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        };
    }

    async findOne(id: string) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const kategori =
            await this.prisma.kategoriSampah.findUnique({
                where: {
                    id,
                },
            });

        if (!kategori) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        return {
            id: kategori.id,
            namaKategori:
                kategori.namaKategori,
            hargaPerKg:
                kategori.hargaPerKg,
            poinPerKg:
                kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        };
    }

    async update(
        id: string,
        dto: UpdateKategoriSampahDto,
        file?: Express.Multer.File,
    ) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const existing =
            await this.prisma.kategoriSampah.findUnique({
                where: {
                    id,
                },
            });

        if (!existing) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const duplicate =
            await this.prisma.kategoriSampah.findFirst({
                where: {
                    namaKategori:
                        dto.namaKategori,
                    NOT: {
                        id,
                    },
                },
            });

        if (duplicate) {
            throw new BadRequestException(
                'data sudah ada',
            );
        }

        let foto: string | undefined =
            undefined;

        if (file) {
            const uploaded =
                await this.cloudinaryService.uploadImage(
                    file,
                    'bank-sampah/kategori-sampah',
                );

            foto = uploaded.secure_url;
        }

        const kategori =
            await this.prisma.kategoriSampah.update({
                where: {
                    id,
                },
                data: {
                    namaKategori:
                        dto.namaKategori,
                    hargaPerKg:
                        dto.hargaPerKg,
                    poinPerKg:
                        dto.poinPerKg,
                    jenis: dto.jenis as
                        | 'plastik'
                        | 'kertas'
                        | 'logam'
                        | 'kaca',
                    ...(foto !== undefined
                        ? { foto }
                        : {}),
                },
            });

        return {
            id: kategori.id,
            namaKategori:
                kategori.namaKategori,
            hargaPerKg:
                kategori.hargaPerKg,
            poinPerKg:
                kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        };
    }

    async remove(id: string) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const existing =
            await this.prisma.kategoriSampah.findUnique({
                where: {
                    id,
                },
            });

        if (!existing) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        await this.prisma.kategoriSampah.delete({
            where: {
                id,
            },
        });

        return {
            id,
        };
    }
}