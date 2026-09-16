import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RekapitulasiService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async bulanan(bulan?: string) {
        if (
            !bulan ||
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(
                bulan,
            )
        ) {
            throw new BadRequestException(
                'Parameter bulan wajib diisi dengan format YYYY-MM.',
            );
        }

        const [year, month] =
            bulan.split('-').map(Number);

        const startDate = new Date(
            Date.UTC(
                year,
                month - 1,
                1,
            ),
        );

        const endDate = new Date(
            Date.UTC(
                year,
                month,
                1,
            ),
        );

        const details =
            await this.prisma.detailSetor.findMany({
                where: {
                    setorSampah: {
                        status: 'selesai',
                        tanggal: {
                            gte: startDate,
                            lt: endDate,
                        },
                    },
                },
                include: {
                    kategoriSampah: true,
                },
            });

        const breakdown: Record<
            string,
            {
                tonaseKg: number;
                rupiah: number;
                poin: number;
            }
        > = {
            plastik: {
                tonaseKg: 0,
                rupiah: 0,
                poin: 0,
            },
            kertas: {
                tonaseKg: 0,
                rupiah: 0,
                poin: 0,
            },
            logam: {
                tonaseKg: 0,
                rupiah: 0,
                poin: 0,
            },
            kaca: {
                tonaseKg: 0,
                rupiah: 0,
                poin: 0,
            },
        };

        let totalKg = 0;
        let totalRupiah = 0;
        let totalPoin = 0;

        for (const detail of details) {
            const jenis =
                detail.kategoriSampah.jenis;

            const rupiah =
                detail.beratKg *
                detail.kategoriSampah.hargaPerKg;

            totalKg += detail.beratKg;
            totalRupiah += rupiah;
            totalPoin +=
                detail.subtotalPoin;

            breakdown[jenis].tonaseKg +=
                detail.beratKg;

            breakdown[jenis].rupiah +=
                rupiah;

            breakdown[jenis].poin +=
                detail.subtotalPoin;
        }

        const [
            totalTransaksiPenukaran,
            penukaranAgg,
        ] = await Promise.all([
            this.prisma.penukaranPoin.count({
                where: {
                    tanggal: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
            }),

            this.prisma.penukaranPoin.aggregate({
                where: {
                    tanggal: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
                _sum: {
                    poinTerpakai: true,
                },
            }),
        ]);

        return {
            periode: bulan,

            rekapitulasiTonase: {
                totalKg,
                totalTon:
                    totalKg / 1000,
                totalEstimasiPembayaranRupiah:
                    totalRupiah,
                totalPoinDiterbitkan:
                    totalPoin,
            },

            breakdownJenisSampah:
                breakdown,

            rekapitulasiPenukaranPoin: {
                totalTransaksiPenukaran,
                totalPoinTerpakai:
                    penukaranAgg._sum
                        .poinTerpakai ?? 0,
            },
        };
    }
}