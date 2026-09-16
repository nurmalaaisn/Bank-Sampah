import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsUUID,
    Min,
} from 'class-validator';

export class VerifyItemSetorDto {
    @IsUUID()
    @IsNotEmpty()
    kategoriSampahId: string;

    @Type(() => Number)
    @IsNumber({
        allowNaN: false,
        allowInfinity: false,
    })
    @Min(0)
    beratKgReal: number;
}