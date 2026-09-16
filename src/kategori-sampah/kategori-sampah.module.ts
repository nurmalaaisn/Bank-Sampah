import { Module } from '@nestjs/common';
import { KategoriSampahController } from './kategori-sampah.controller';
import { KategoriSampahService } from './kategori-sampah.service';


@Module({
    controllers: [KategoriSampahController],
    providers: [
        KategoriSampahService,
    ],
})
export class KategoriSampahModule {}