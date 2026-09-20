import { Module } from '@nestjs/common';

import { KategoriSampahController } from './kategori-sampah.controller';
import { KategoriSampahService } from './kategori-sampah.service';

import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
    imports: [
        CloudinaryModule,
    ],
    controllers: [
        KategoriSampahController,
    ],
    providers: [
        KategoriSampahService,
    ],
})
export class KategoriSampahModule {}