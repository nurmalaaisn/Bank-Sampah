import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NasabahModule } from './nasabah/nasabah.module';
import { KategoriSampahModule } from './kategori-sampah/kategori-sampah.module';
import { SetorSampahModule } from './setor-sampah/setor-sampah.module';
import { HadiahModule } from './hadiah/hadiah.module';
import { PenukaranPoinModule } from './penukaran-poin/penukaran-poin.module';
import { RekapitulasiModule } from './rekapitulasi/rekapitulasi.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    NasabahModule,
    KategoriSampahModule,
    SetorSampahModule,
    HadiahModule,
    PenukaranPoinModule,
    RekapitulasiModule,
    DashboardModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule{}