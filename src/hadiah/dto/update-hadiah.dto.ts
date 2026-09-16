import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class UpdateHadiahDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    namaHadiah: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    poinDibutuhkan: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    stok: number;
}