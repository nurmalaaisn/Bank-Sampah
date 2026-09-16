import { Module } from '@nestjs/common';
import { SetorSampahController } from './setor-sampah.controller';
import { SetorSampahService } from './setor-sampah.service';

@Module({
    controllers: [
        SetorSampahController,
    ],
    providers: [
        SetorSampahService,
    ],
})
export class SetorSampahModule { }