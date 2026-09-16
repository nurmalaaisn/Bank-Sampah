import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async summary(userId: string) {
        const nasabah =
            await this.prisma.nasabah.findUnique({
                where: {
                    idUser: userId,
                },
            });

        if (!nasabah) {
            throw new NotFoundException(
                'Data nasabah tidak ditemukan.',
            );
        }

        const [
            setorAgg,
            tukarAgg,
            transaksiTerakhirSetor,
            transaksiTerakhirTukar,
        ] = await Promise.all([
            this.prisma.setorSampah.aggregate({
                where: {
                    idNasabah: nasabah.id,
                    status: 'selesai',
                },
                _sum: {
                    totalBeratKg: true,
                    totalPoin: true,
                },
            }),

            this.prisma.penukaranPoin.aggregate({
                where: {
                    idNasabah: nasabah.id,
                },
                _sum: {
                    poinTerpakai: true,
                },
            }),

            this.prisma.setorSampah.findFirst({
                where: {
                    idNasabah: nasabah.id,
                },
                orderBy: {
                    tanggal: 'desc',
                },
            }),

            this.prisma.penukaranPoin.findFirst({
                where: {
                    idNasabah: nasabah.id,
                },
                orderBy: {
                    tanggal: 'desc',
                },
                include: {
                    hadiah: true,
                },
            }),
        ]);

        return {
            saldoPoinSaatIni:
                nasabah.saldoPoin,

            totalSampahDisetorKg:
                setorAgg._sum.totalBeratKg ??
                0,

            totalPoinDidapat:
                setorAgg._sum.totalPoin ??
                0,

            totalPoinDitukar:
                tukarAgg._sum.poinTerpakai ??
                0,

            transaksiTerakhirSetor:
                transaksiTerakhirSetor
                    ? {
                          kodeSetor:
                              transaksiTerakhirSetor.kodeSetor,
                          tanggal:
                              transaksiTerakhirSetor.tanggal,
                          beratKg:
                              transaksiTerakhirSetor.totalBeratKg,
                          poin:
                              transaksiTerakhirSetor.totalPoin,
                          status:
                              transaksiTerakhirSetor.status,
                      }
                    : null,

            transaksiTerakhirTukar:
                transaksiTerakhirTukar
                    ? {
                          kodePenukaran:
                              transaksiTerakhirTukar.kodePenukaran,
                          tanggal:
                              transaksiTerakhirTukar.tanggal,
                          hadiah:
                              transaksiTerakhirTukar.hadiah.namaHadiah,
                          poin:
                              transaksiTerakhirTukar.poinTerpakai,
                          status:
                              transaksiTerakhirTukar.status,
                      }
                    : null,
        };
    }

    async stats() {
        const [
            totalNasabah,
            totalKategoriSampah,
            totalTransaksiSetor,
            totalHadiah,
            setorAgg,
        ] = await Promise.all([
            this.prisma.user.count({
                where: {
                    role: 'nasabah',
                },
            }),

            this.prisma.kategoriSampah.count(),

            this.prisma.setorSampah.count(),

            this.prisma.hadiah.count(),

            this.prisma.setorSampah.aggregate({
                where: {
                    status: 'selesai',
                },
                _sum: {
                    totalBeratKg: true,
                    totalPoin: true,
                },
            }),
        ]);

        return {
            totalNasabah,
            totalKategoriSampah,
            totalTransaksiSetor,
            totalHadiah,

            totalBeratSampahKg:
                setorAgg._sum.totalBeratKg ??
                0,

            totalPoinTersalurkan:
                setorAgg._sum.totalPoin ??
                0,
        };
    }
}