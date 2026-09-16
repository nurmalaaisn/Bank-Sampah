import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';

function generateKodePenukaran(): string {
    const now = new Date();

    const yyyymm =
        `${now.getFullYear()}${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}`;

    const random =
        Math.floor(
            100000 + Math.random() * 900000,
        );

    return `TKR-${yyyymm}-${random}`;
}

@Injectable()
export class PenukaranPoinService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async tukar(
        dto: CreatePenukaranPoinDto,
        nasabahId: string,
    ) {
        if (!this.isValidUuid(dto.hadiahId)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        if (!this.isValidUuid(nasabahId)) {
            throw new NotFoundException(
                'Data nasabah tidak ditemukan.',
            );
        }

        const hadiah =
            await this.prisma.hadiah.findUnique({
                where: {
                    id: dto.hadiahId,
                },
            });

        if (!hadiah) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const nasabah =
            await this.prisma.nasabah.findUnique({
                where: {
                    id: nasabahId,
                },
            });

        if (!nasabah) {
            throw new NotFoundException(
                'Data nasabah tidak ditemukan.',
            );
        }

        /*
         * Pengecekan awal untuk memberikan
         * pesan error yang sesuai kepada user.
         *
         * Validasi final tetap dilakukan
         * secara atomic di dalam transaction.
         */
        if (hadiah.stok < 1) {
            throw new BadRequestException(
                'stock hadiah tidak mencukupi',
            );
        }

        if (
            nasabah.saldoPoin <
            hadiah.poinDibutuhkan
        ) {
            throw new BadRequestException(
                `Saldo poin Anda (${nasabah.saldoPoin} poin) tidak mencukupi untuk menukar hadiah ini (${hadiah.poinDibutuhkan} poin).`,
            );
        }

        const result =
            await this.prisma.$transaction(
                async (tx) => {
                    /*
                     * Saldo hanya dapat dikurangi
                     * jika saldo aktual masih mencukupi.
                     */
                    const saldoUpdated =
                        await tx.nasabah.updateMany({
                            where: {
                                id: nasabah.id,
                                saldoPoin: {
                                    gte:
                                        hadiah.poinDibutuhkan,
                                },
                            },
                            data: {
                                saldoPoin: {
                                    decrement:
                                        hadiah.poinDibutuhkan,
                                },
                            },
                        });

                    if (
                        saldoUpdated.count !== 1
                    ) {
                        throw new BadRequestException(
                            'Saldo poin tidak mencukupi.',
                        );
                    }

                    /*
                     * Stok hanya dapat dikurangi
                     * jika stok aktual masih lebih
                     * dari 0.
                     */
                    const stokUpdated =
                        await tx.hadiah.updateMany({
                            where: {
                                id: hadiah.id,
                                stok: {
                                    gt: 0,
                                },
                            },
                            data: {
                                stok: {
                                    decrement: 1,
                                },
                            },
                        });

                    if (
                        stokUpdated.count !== 1
                    ) {
                        throw new BadRequestException(
                            'stock hadiah tidak mencukupi',
                        );
                    }

                    const nasabahUpdated =
                        await tx.nasabah.findUnique({
                            where: {
                                id: nasabah.id,
                            },
                            select: {
                                saldoPoin: true,
                            },
                        });

                    if (!nasabahUpdated) {
                        throw new NotFoundException(
                            'Data nasabah tidak ditemukan.',
                        );
                    }

                    const penukaran =
                        await tx.penukaranPoin.create({
                            data: {
                                kodePenukaran:
                                    generateKodePenukaran(),
                                idNasabah:
                                    nasabah.id,
                                idHadiah:
                                    hadiah.id,
                                poinTerpakai:
                                    hadiah.poinDibutuhkan,
                                status:
                                    'diproses',
                            },
                        });

                    return {
                        penukaran,
                        sisaSaldoPoin:
                            nasabahUpdated.saldoPoin,
                    };
                },
            );

        return {
            id: result.penukaran.id,
            kodePenukaran:
                result.penukaran.kodePenukaran,
            tanggal:
                result.penukaran.tanggal,
            hadiahId:
                hadiah.id,
            poinTerpakai:
                result.penukaran.poinTerpakai,
            sisaSaldoPoin:
                result.sisaSaldoPoin,
            status:
                result.penukaran.status,
            hadiah: {
                namaHadiah:
                    hadiah.namaHadiah,
            },
        };
    }

    async myList(
        nasabahId: string,
    ) {
        if (!this.isValidUuid(nasabahId)) {
            throw new NotFoundException(
                'Data nasabah tidak ditemukan.',
            );
        }

        const list =
            await this.prisma.penukaranPoin.findMany({
                where: {
                    idNasabah: nasabahId,
                },
                include: {
                    hadiah: {
                        select: {
                            namaHadiah: true,
                            poinDibutuhkan: true,
                            foto: true,
                        },
                    },
                },
                orderBy: {
                    tanggal: 'desc',
                },
            });

        return list.map((item) => ({
            id: item.id,
            kodePenukaran:
                item.kodePenukaran,
            tanggal: item.tanggal,
            poinTerpakai:
                item.poinTerpakai,
            status: item.status,
            hadiah: {
                namaHadiah:
                    item.hadiah.namaHadiah,
                poinDibutuhkan:
                    item.hadiah
                        .poinDibutuhkan,
                foto:
                    item.hadiah.foto,
            },
        }));
    }

    async adminList(
        bulan?: string,
    ) {
        const where: {
            tanggal?: {
                gte: Date;
                lt: Date;
            };
        } = {};

        if (bulan) {
            if (
                !/^\d{4}-(0[1-9]|1[0-2])$/.test(
                    bulan,
                )
            ) {
                throw new BadRequestException(
                    'Format bulan harus YYYY-MM.',
                );
            }

            const [year, month] =
                bulan.split('-').map(Number);

            where.tanggal = {
                gte: new Date(
                    Date.UTC(
                        year,
                        month - 1,
                        1,
                    ),
                ),
                lt: new Date(
                    Date.UTC(
                        year,
                        month,
                        1,
                    ),
                ),
            };
        }

        const list =
            await this.prisma.penukaranPoin.findMany({
                where,
                include: {
                    nasabah: {
                        select: {
                            namaNasabah: true,
                            telp: true,
                        },
                    },
                    hadiah: {
                        select: {
                            namaHadiah: true,
                        },
                    },
                },
                orderBy: {
                    tanggal: 'desc',
                },
            });

        return list.map((item) => ({
            id: item.id,
            kodePenukaran:
                item.kodePenukaran,
            tanggal: item.tanggal,
            nasabah:
                item.nasabah,
            hadiah:
                item.hadiah,
            poinTerpakai:
                item.poinTerpakai,
            status:
                item.status,
        }));
    }

    async updateStatus(
        id: string,
        status: string,
    ) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        if (
            status !== 'diproses' &&
            status !== 'selesai'
        ) {
            throw new BadRequestException(
                'Status tidak valid.',
            );
        }

        const penukaran =
            await this.prisma.penukaranPoin.findUnique({
                where: {
                    id,
                },
            });

        if (!penukaran) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        /*
         * Status selesai merupakan status final.
         */
        if (
            penukaran.status === 'selesai' &&
            status === 'diproses'
        ) {
            throw new BadRequestException(
                'Transaksi yang sudah selesai tidak dapat dikembalikan menjadi diproses.',
            );
        }

        /*
         * Tidak perlu melakukan update
         * jika statusnya sama.
         */
        if (
            penukaran.status === status
        ) {
            throw new BadRequestException(
                'Status transaksi sudah sesuai.',
            );
        }

        const updated =
            await this.prisma.penukaranPoin.update({
                where: {
                    id: penukaran.id,
                },
                data: {
                    status:
                        status as
                            | 'diproses'
                            | 'selesai',
                },
            });

        return {
            id: updated.id,
            status: updated.status,
        };
    }

    async getNota(
        id: string,
        currentUser: {
            userId: string;
            role: string;
        },
    ) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        const penukaran =
            await this.prisma.penukaranPoin.findUnique({
                where: {
                    id,
                },
                include: {
                    nasabah: {
                        select: {
                            id: true,
                            namaNasabah: true,
                            telp: true,
                        },
                    },
                    hadiah: {
                        select: {
                            namaHadiah: true,
                            poinDibutuhkan: true,
                        },
                    },
                },
            });

        if (!penukaran) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        /*
         * Nasabah hanya boleh melihat
         * nota miliknya sendiri.
         *
         * Admin bank dapat melihat semua nota
         * karena akses role sudah dilindungi
         * oleh RolesGuard/controller.
         */
        if (
            currentUser.role.toLowerCase() ===
            'nasabah'
        ) {
            const nasabah =
                await this.prisma.nasabah.findUnique({
                    where: {
                        idUser:
                            currentUser.userId,
                    },
                });

            if (
                !nasabah ||
                nasabah.id !==
                    penukaran.idNasabah
            ) {
                throw new ForbiddenException(
                    'Anda tidak berhak mengakses data ini.',
                );
            }
        }

        return {
            id: penukaran.id,
            kodePenukaran:
                penukaran.kodePenukaran,
            tanggal:
                penukaran.tanggal,
            nasabah: {
                namaNasabah:
                    penukaran.nasabah
                        .namaNasabah,
                telp:
                    penukaran.nasabah.telp,
            },
            hadiah: {
                namaHadiah:
                    penukaran.hadiah
                        .namaHadiah,
                poinDibutuhkan:
                    penukaran.hadiah
                        .poinDibutuhkan,
            },
            poinTerpakai:
                penukaran.poinTerpakai,
            status:
                penukaran.status,
        };
    }

    private isValidUuid(
        id: string,
    ): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
        );
    }
}