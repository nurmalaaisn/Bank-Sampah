import { Module } from '@nestjs/common';

import { NasabahController } from './nasabah.controller';
import { NasabahService } from './nasabah.service';

import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
    imports: [
        CloudinaryModule,
    ],
    controllers: [
        NasabahController,
    ],
    providers: [
        NasabahService,
    ],
})
export class NasabahModule {}