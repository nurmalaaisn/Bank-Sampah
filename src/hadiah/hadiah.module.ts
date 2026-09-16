import { Module } from '@nestjs/common';

import { HadiahController } from './hadiah.controller';
import { HadiahService } from './hadiah.service';

@Module({
    controllers: [
        HadiahController,
    ],
    providers: [
        HadiahService,
    ],
})
export class HadiahModule { }