import { Type } from 'class-transformer';
import {
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateKategoriSampahDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    namaKategori: string;

    @Type(() => Number)
    @IsNumber({
        allowNaN: false,
        allowInfinity: false,
    })
    @Min(0.01)
    hargaPerKg: number;

    @Type(() => Number)
    @IsNumber({
        allowNaN: false,
        allowInfinity: false,
    })
    @Min(0.01)
    poinPerKg: number;

    @IsString()
    @IsIn([
        'plastik',
        'kertas',
        'logam',
        'kaca',
    ])
    jenis: string;
}