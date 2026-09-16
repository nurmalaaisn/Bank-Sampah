import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

@Injectable()
export class KategoriSampahService {
    constructor(private readonly prisma: PrismaService) {}

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
        foto?: string,
    ) {
        const existing =
            await this.prisma.kategoriSampah.findFirst({
                where: {
                    namaKategori: dto.namaKategori,
                },
            });

        if (existing) {
            throw new BadRequestException('data sudah ada');
        }

        const kategori =
            await this.prisma.kategoriSampah.create({
                data: {
                    namaKategori: dto.namaKategori,
                    hargaPerKg: dto.hargaPerKg,
                    poinPerKg: dto.poinPerKg,
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
            namaKategori: kategori.namaKategori,
            hargaPerKg: kategori.hargaPerKg,
            poinPerKg: kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        };
    }

    async findOne(id: string) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException('data tidak ada');
        }

        const kategori =
            await this.prisma.kategoriSampah.findUnique({
                where: {
                    id,
                },
            });

        if (!kategori) {
            throw new NotFoundException('data tidak ada');
        }

        return {
            id: kategori.id,
            namaKategori: kategori.namaKategori,
            hargaPerKg: kategori.hargaPerKg,
            poinPerKg: kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        };
    }

    async update(
        id: string,
        dto: UpdateKategoriSampahDto,
        foto?: string,
    ) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException('data tidak ada');
        }

        const existing =
            await this.prisma.kategoriSampah.findUnique({
                where: {
                    id,
                },
            });

        if (!existing) {
            throw new NotFoundException('data tidak ada');
        }

        const duplicate =
            await this.prisma.kategoriSampah.findFirst({
                where: {
                    namaKategori: dto.namaKategori,
                    NOT: {
                        id,
                    },
                },
            });

        if (duplicate) {
            throw new BadRequestException('data sudah ada');
        }

        const kategori =
            await this.prisma.kategoriSampah.update({
                where: {
                    id,
                },
                data: {
                    namaKategori: dto.namaKategori,
                    hargaPerKg: dto.hargaPerKg,
                    poinPerKg: dto.poinPerKg,
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
            namaKategori: kategori.namaKategori,
            hargaPerKg: kategori.hargaPerKg,
            poinPerKg: kategori.poinPerKg,
            jenis: kategori.jenis,
            foto: kategori.foto,
        };
    }

    async remove(id: string) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException('data tidak ada');
        }

        const existing =
            await this.prisma.kategoriSampah.findUnique({
                where: {
                    id,
                },
            });

        if (!existing) {
            throw new NotFoundException('data tidak ada');
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