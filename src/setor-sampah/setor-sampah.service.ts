import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';

function generateKodeSetor(): string {
    const now = new Date();

    const yyyymm =
        `${now.getFullYear()}${String(
            now.getMonth() + 1,
        ).padStart(2, '0')}`;

    const random =
        Math.floor(
            100000 + Math.random() * 900000,
        );

    return `STR-${yyyymm}-${random}`;
}

@Injectable()
export class SetorSampahService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async pengajuan(
        dto: CreateSetorSampahDto,
        nasabahId: string,
    ) {
        if (!this.isValidUuid(nasabahId)) {
            throw new NotFoundException(
                'Data nasabah tidak ditemukan.',
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

        const itemsWithPoin: {
            kategoriSampahId: string;
            beratKg: number;
            subtotalPoin: number;
        }[] = [];

        for (const item of dto.items) {
            if (
                !this.isValidUuid(
                    item.kategoriSampahId,
                )
            ) {
                throw new NotFoundException(
                    'Kategori sampah tidak ditemukan.',
                );
            }

            const kategori =
                await this.prisma.kategoriSampah.findUnique(
                    {
                        where: {
                            id: item.kategoriSampahId,
                        },
                    },
                );

            if (!kategori) {
                throw new NotFoundException(
                    `Kategori sampah dengan id ${item.kategoriSampahId} tidak ditemukan.`,
                );
            }

            const subtotalPoin =
                item.beratKg *
                kategori.poinPerKg;

            itemsWithPoin.push({
                kategoriSampahId:
                    item.kategoriSampahId,
                beratKg: item.beratKg,
                subtotalPoin,
            });
        }

        const totalBeratKg =
            itemsWithPoin.reduce(
                (total, item) =>
                    total + item.beratKg,
                0,
            );

        const estimasiTotalPoin =
            itemsWithPoin.reduce(
                (total, item) =>
                    total + item.subtotalPoin,
                0,
            );

        const setor =
            await this.prisma.$transaction(
                async (tx) => {
                    const created =
                        await tx.setorSampah.create({
                            data: {
                                kodeSetor:
                                    generateKodeSetor(),
                                tanggal:
                                    new Date(
                                        dto.tanggal,
                                    ),
                                idNasabah:
                                    nasabahId,
                                totalBeratKg,
                                totalPoin:
                                    estimasiTotalPoin,
                                catatan:
                                    dto.catatan,
                            },
                        });

                    await tx.detailSetor.createMany({
                        data: itemsWithPoin.map(
                            (item) => ({
                                idSetor:
                                    created.id,
                                idKategoriSampah:
                                    item.kategoriSampahId,
                                beratKg:
                                    item.beratKg,
                                subtotalPoin:
                                    item.subtotalPoin,
                            }),
                        ),
                    });

                    return created;
                },
            );

        return {
            id: setor.id,
            kodeSetor:
                setor.kodeSetor,
            tanggal: setor.tanggal,
            status: setor.status,
            totalBeratKg:
                setor.totalBeratKg,
            estimasiTotalPoin:
                setor.totalPoin,
            catatan: setor.catatan,
            detailSetors:
                itemsWithPoin,
        };
    }

    async myList(
        nasabahId: string,
        bulan?: string,
    ) {
        if (!this.isValidUuid(nasabahId)) {
            throw new NotFoundException(
                'Data nasabah tidak ditemukan.',
            );
        }

        const where: {
            idNasabah: string;
            tanggal?: {
                gte: Date;
                lt: Date;
            };
        } = {
            idNasabah: nasabahId,
        };

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

        const setorList =
            await this.prisma.setorSampah.findMany({
                where,
                include: {
                    detailSetor: {
                        include: {
                            kategoriSampah: {
                                select: {
                                    namaKategori: true,
                                    jenis: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    tanggal: 'desc',
                },
            });

        return setorList.map((setor) => ({
            id: setor.id,
            kodeSetor:
                setor.kodeSetor,
            tanggal: setor.tanggal,
            status: setor.status,
            totalBeratKg:
                setor.totalBeratKg,
            totalPoin:
                setor.totalPoin,
            catatan: setor.catatan,
            detailSetors:
                setor.detailSetor.map(
                    (detail) => ({
                        kategoriSampahId:
                            detail.idKategoriSampah,
                        beratKg:
                            detail.beratKg,
                        subtotalPoin:
                            detail.subtotalPoin,
                        kategoriSampah:
                            detail.kategoriSampah,
                    }),
                ),
        }));
    }

    async adminList(
        status?: string,
        bulan?: string,
    ) {
        const where: {
            status?:
                | 'menunggu_konfirmasi'
                | 'diverifikasi'
                | 'selesai'
                | 'ditolak';
            tanggal?: {
                gte: Date;
                lt: Date;
            };
        } = {};

        if (status) {
            const allowedStatus = [
                'menunggu_konfirmasi',
                'diverifikasi',
                'selesai',
                'ditolak',
            ] as const;

            if (
                !allowedStatus.includes(
                    status as
                        | 'menunggu_konfirmasi'
                        | 'diverifikasi'
                        | 'selesai'
                        | 'ditolak',
                )
            ) {
                throw new BadRequestException(
                    'Status tidak valid.',
                );
            }

            where.status =
                status as
                    | 'menunggu_konfirmasi'
                    | 'diverifikasi'
                    | 'selesai'
                    | 'ditolak';
        }

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

        const setorList =
            await this.prisma.setorSampah.findMany({
                where,
                include: {
                    nasabah: {
                        select: {
                            namaNasabah: true,
                            telp: true,
                        },
                    },
                },
                orderBy: {
                    tanggal: 'desc',
                },
            });

        return setorList.map((setor) => ({
            id: setor.id,
            kodeSetor:
                setor.kodeSetor,
            tanggal: setor.tanggal,
            nasabah:
                setor.nasabah,
            status: setor.status,
            totalBeratKg:
                setor.totalBeratKg,
            totalPoin:
                setor.totalPoin,
        }));
    }

    async findOne(
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

        const setor =
            await this.prisma.setorSampah.findUnique({
                where: {
                    id,
                },
                include: {
                    nasabah: true,
                    detailSetor: {
                        include: {
                            kategoriSampah: {
                                select: {
                                    namaKategori: true,
                                    jenis: true,
                                    poinPerKg: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!setor) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

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
                    setor.idNasabah
            ) {
                throw new ForbiddenException(
                    'Anda tidak berhak mengakses data ini.',
                );
            }
        }

        return {
            id: setor.id,
            kodeSetor:
                setor.kodeSetor,
            tanggal: setor.tanggal,
            status: setor.status,
            nasabah: {
                namaNasabah:
                    setor.nasabah.namaNasabah,
                alamat:
                    setor.nasabah.alamat,
                telp: setor.nasabah.telp,
            },
            totalBeratKg:
                setor.totalBeratKg,
            totalPoin:
                setor.totalPoin,
            catatanAdmin:
                setor.catatanAdmin,
            detailSetors:
                setor.detailSetor.map(
                    (detail) => ({
                        kategori:
                            detail.kategoriSampah
                                .namaKategori,
                        jenis:
                            detail.kategoriSampah
                                .jenis,
                        beratKg:
                            detail.beratKg,
                        poinPerKg:
                            detail.kategoriSampah
                                .poinPerKg,
                        subtotalPoin:
                            detail.subtotalPoin,
                    }),
                ),
        };
    }

    async verify(
        id: string,
        dto: VerifySetorSampahDto,
        adminBankId: string,
    ) {
        if (!this.isValidUuid(id)) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        if (
            !this.isValidUuid(adminBankId)
        ) {
            throw new ForbiddenException(
                'Data admin bank tidak ditemukan.',
            );
        }

        const setor =
            await this.prisma.setorSampah.findUnique({
                where: {
                    id,
                },
                include: {
                    detailSetor: true,
                },
            });

        if (!setor) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        if (
            setor.status === 'selesai' ||
            setor.status === 'ditolak'
        ) {
            throw new BadRequestException(
                'Transaksi ini sudah diverifikasi sebelumnya, tidak dapat diproses ulang.',
            );
        }

        let totalPoinFinal =
            setor.totalPoin;

        if (
            dto.itemsReal &&
            dto.itemsReal.length > 0
        ) {
            let totalReal = 0;

            for (
                const itemReal of dto.itemsReal
            ) {
                if (
                    !this.isValidUuid(
                        itemReal.kategoriSampahId,
                    )
                ) {
                    throw new NotFoundException(
                        'Kategori sampah tidak ditemukan.',
                    );
                }

                const kategori =
                    await this.prisma.kategoriSampah.findUnique(
                        {
                            where: {
                                id: itemReal.kategoriSampahId,
                            },
                        },
                    );

                if (!kategori) {
                    throw new NotFoundException(
                        `Kategori sampah dengan id ${itemReal.kategoriSampahId} tidak ditemukan.`,
                    );
                }

                totalReal +=
                    itemReal.beratKgReal *
                    kategori.poinPerKg;
            }

            totalPoinFinal =
                totalReal;
        }

        const updated =
            await this.prisma.$transaction(
                async (tx) => {
                    /*
                     * Hanya transaksi yang masih
                     * belum final yang dapat diproses.
                     */
                    const updateResult =
                        await tx.setorSampah.updateMany({
                            where: {
                                id: setor.id,
                                status: {
                                    in: [
                                        'menunggu_konfirmasi',
                                        'diverifikasi',
                                    ],
                                },
                            },
                            data: {
                                status:
                                    dto.status as
                                        | 'menunggu_konfirmasi'
                                        | 'diverifikasi'
                                        | 'selesai'
                                        | 'ditolak',
                                catatanAdmin:
                                    dto.catatanAdmin,
                                totalPoin:
                                    totalPoinFinal,
                                idAdmin:
                                    adminBankId,
                            },
                        });

                    if (
                        updateResult.count !== 1
                    ) {
                        throw new BadRequestException(
                            'Transaksi ini sudah diverifikasi sebelumnya, tidak dapat diproses ulang.',
                        );
                    }

                    /*
                     * Poin hanya ditambahkan ketika
                     * status berubah menjadi selesai.
                     */
                    if (
                        dto.status === 'selesai'
                    ) {
                        await tx.nasabah.update({
                            where: {
                                id: setor.idNasabah,
                            },
                            data: {
                                saldoPoin: {
                                    increment:
                                        totalPoinFinal,
                                },
                            },
                        });
                    }

                    return tx.setorSampah.findUnique({
                        where: {
                            id: setor.id,
                        },
                    });
                },
            );

        if (!updated) {
            throw new NotFoundException(
                'data tidak ada',
            );
        }

        return {
            id: updated.id,
            status: updated.status,
            totalPoin:
                updated.totalPoin,
            catatanAdmin:
                updated.catatanAdmin,
        };
    }

    private isValidUuid(id: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id,
        );
    }
}