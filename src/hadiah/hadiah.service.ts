import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

@Injectable()
export class HadiahService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    private isValidUuid(id: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
        );
    }

    async findAll() {
        return this.prisma.hadiah.findMany({
            orderBy: {
                namaHadiah: 'asc',
            },
        });
    }

    async create(
        dto: CreateHadiahDto,
        foto?: string,
    ) {
        const existing =
            await this.prisma.hadiah.findFirst({
                where: {
                    namaHadiah: dto.namaHadiah,
                },
            });

        if (existing) {
            throw new BadRequestException(
                'data sudah ada',
            );
        }

        return this.prisma.hadiah.create({
            data: {
                namaHadiah: dto.namaHadiah,
                poinDibutuhkan:
                    dto.poinDibutuhkan,
                stok: dto.stok,
                foto,
            },
        });
    }

    async findOne(id: string) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const hadiah =
            await this.prisma.hadiah.findUnique({
                where: {
                    id,
                },
            });

        if (!hadiah) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        return hadiah;
    }

    async update(
        id: string,
        dto: UpdateHadiahDto,
        foto?: string,
    ) {
        const existing =
            await this.findOne(id);

        const duplicate =
            await this.prisma.hadiah.findFirst({
                where: {
                    namaHadiah: dto.namaHadiah,
                    NOT: {
                        id: existing.id,
                    },
                },
            });

        if (duplicate) {
            throw new BadRequestException(
                'data sudah ada',
            );
        }

        const updated =
            await this.prisma.hadiah.update({
                where: {
                    id: existing.id,
                },
                data: {
                    namaHadiah:
                        dto.namaHadiah,
                    poinDibutuhkan:
                        dto.poinDibutuhkan,
                    stok: dto.stok,
                    ...(foto !== undefined
                        ? { foto }
                        : {}),
                },
            });

        return {
            id: updated.id,
            namaHadiah:
                updated.namaHadiah,
            poinDibutuhkan:
                updated.poinDibutuhkan,
            stok: updated.stok,
            foto: updated.foto,
        };
    }

    async remove(id: string) {
        const existing =
            await this.findOne(id);

        await this.prisma.hadiah.delete({
            where: {
                id: existing.id,
            },
        });

        return {
            id: existing.id,
        };
    }
}