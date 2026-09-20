import { Module } from '@nestjs/common';

import { HadiahController } from './hadiah.controller';
import { HadiahService } from './hadiah.service';

import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
    imports: [
        CloudinaryModule,
    ],
    controllers: [
        HadiahController,
    ],
    providers: [
        HadiahService,
    ],
})
export class HadiahModule {}