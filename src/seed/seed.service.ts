import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

function randomSuffix(): string {
    return Math.floor(
        1000 + Math.random() * 9000,
    ).toString();
}

@Injectable()
export class SeedService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async seed() {
        const suffix = randomSuffix();

        const defaultPasswordAdmin =
            'admin123';

        const defaultPasswordNasabah =
            'password123';

        const hashedAdmin =
            await bcrypt.hash(
                defaultPasswordAdmin,
                10,
            );

        const hashedNasabah =
            await bcrypt.hash(
                defaultPasswordNasabah,
                10,
            );

        const result =
            await this.prisma.$transaction(
                async (tx) => {
                    const adminUser =
                        await tx.user.create({
                            data: {
                                username:
                                    `admin_banksampah_${suffix}`,
                                password:
                                    hashedAdmin,
                                role:
                                    'admin_bank',
                            },
                        });

                    const adminBank =
                        await tx.adminBank.create({
                            data: {
                                namaUnit:
                                    'Bank Sampah Asri Jaya',
                                namaPengelola:
                                    'Bapak H. Sukirman',
                                telp:
                                    '081234567890',
                                idUser:
                                    adminUser.id,
                            },
                        });

                    const nasabah1User =
                        await tx.user.create({
                            data: {
                                username:
                                    `nasabah_budi_${suffix}`,
                                password:
                                    hashedNasabah,
                                role:
                                    'nasabah',
                            },
                        });

                    const nasabah1 =
                        await tx.nasabah.create({
                            data: {
                                namaNasabah:
                                    'Budi Santoso',
                                alamat:
                                    'Jl. Merdeka No. 12, RT 03/05',
                                telp:
                                    '085678901234',
                                saldoPoin: 150,
                                idUser:
                                    nasabah1User.id,
                            },
                        });

                    const nasabah2User =
                        await tx.user.create({
                            data: {
                                username:
                                    `nasabah_siti_${suffix}`,
                                password:
                                    hashedNasabah,
                                role:
                                    'nasabah',
                            },
                        });

                    const nasabah2 =
                        await tx.nasabah.create({
                            data: {
                                namaNasabah:
                                    'Siti Aminah',
                                alamat:
                                    'Jl. Mawar Indah No. 45',
                                telp:
                                    '081987654321',
                                saldoPoin: 80,
                                idUser:
                                    nasabah2User.id,
                            },
                        });

                    const kategoriData = [
                        {
                            namaKategori:
                                'Botol Plastik PET (Bersih)',
                            hargaPerKg: 3500,
                            poinPerKg: 10,
                            jenis: 'plastik',
                        },
                        {
                            namaKategori:
                                'Kardus & Karton Bekas',
                            hargaPerKg: 2000,
                            poinPerKg: 5,
                            jenis: 'kertas',
                        },
                        {
                            namaKategori:
                                'Kaleng Aluminium / Minuman',
                            hargaPerKg: 12000,
                            poinPerKg: 30,
                            jenis: 'logam',
                        },
                        {
                            namaKategori:
                                'Botol Kaca Bening',
                            hargaPerKg: 1500,
                            poinPerKg: 4,
                            jenis: 'kaca',
                        },
                    ];

                    const kategoriList: any[] = [];

                    for (
                        const kategori of kategoriData
                    ) {
                        const existing =
                            await tx.kategoriSampah.findFirst({
                                where: {
                                    namaKategori:
                                        kategori.namaKategori,
                                },
                            });

                        if (existing) {
                            kategoriList.push(
                                existing,
                            );
                            continue;
                        }

                        const created =
                            await tx.kategoriSampah.create({
                                data: {
                                    namaKategori:
                                        kategori.namaKategori,
                                    hargaPerKg:
                                        kategori.hargaPerKg,
                                    poinPerKg:
                                        kategori.poinPerKg,
                                    jenis:
                                        kategori.jenis as any,
                                },
                            });

                        kategoriList.push(
                            created,
                        );
                    }

                    const hadiahData = [
                        {
                            namaHadiah:
                                'Voucher Pulsa / E-Wallet Rp 25.000',
                            poinDibutuhkan: 75,
                            stok: 50,
                        },
                        {
                            namaHadiah:
                                'Minyak Goreng Bimoli 1 Liter',
                            poinDibutuhkan: 100,
                            stok: 25,
                        },
                        {
                            namaHadiah:
                                'Beras Super Pulen 2.5 Kg',
                            poinDibutuhkan: 180,
                            stok: 15,
                        },
                    ];

                    const hadiahList: any[] = [];

                    for (
                        const hadiah of hadiahData
                    ) {
                        const existing =
                            await tx.hadiah.findFirst({
                                where: {
                                    namaHadiah:
                                        hadiah.namaHadiah,
                                },
                            });

                        if (existing) {
                            hadiahList.push(
                                existing,
                            );
                            continue;
                        }

                        const created =
                            await tx.hadiah.create({
                                data: {
                                    namaHadiah:
                                        hadiah.namaHadiah,
                                    poinDibutuhkan:
                                        hadiah.poinDibutuhkan,
                                    stok:
                                        hadiah.stok,
                                },
                            });

                        hadiahList.push(
                            created,
                        );
                    }

                    const setor =
                        await tx.setorSampah.create({
                            data: {
                                kodeSetor:
                                    `STR-SEED-${suffix}`,
                                tanggal: new Date(),
                                idAdmin:
                                    adminBank.id,
                                idNasabah:
                                    nasabah1.id,
                                status:
                                    'selesai',
                                totalBeratKg: 15,
                                totalPoin: 150,
                                catatan:
                                    'Data seed otomatis',
                                catatanAdmin:
                                    'Seed data',
                            },
                        });

                    await tx.detailSetor.create({
                        data: {
                            idSetor:
                                setor.id,
                            idKategoriSampah:
                                kategoriList[0].id,
                            beratKg: 15,
                            subtotalPoin: 150,
                        },
                    });

                    return {
                        adminUser,
                        nasabah1User,
                        nasabah2User,
                        kategoriList,
                        hadiahList,
                    };
                },
            );

        return {
            admin: {
                username:
                    result.adminUser.username,
                password:
                    defaultPasswordAdmin,
                namaUnit:
                    'Bank Sampah Asri Jaya',
            },

            nasabah1: {
                username:
                    result.nasabah1User.username,
                password:
                    defaultPasswordNasabah,
                namaNasabah:
                    'Budi Santoso',
                saldoPoin: 150,
            },

            nasabah2: {
                username:
                    result.nasabah2User.username,
                password:
                    defaultPasswordNasabah,
                namaNasabah:
                    'Siti Aminah',
                saldoPoin: 80,
            },

            kategoriSampahCount:
                result.kategoriList.length,

            hadiahKatalogCount:
                result.hadiahList.length,
        };
    }
}