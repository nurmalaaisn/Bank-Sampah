import { Type } from 'class-transformer';
import {
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { VerifyItemSetorDto } from './verify-item-setor.dto';

export class VerifySetorSampahDto {
    @IsString()
    @IsIn([
        'diverifikasi',
        'selesai',
        'ditolak',
    ])
    status: string;

    @IsOptional()
    @IsString()
    catatanAdmin?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VerifyItemSetorDto)
    itemsReal?: VerifyItemSetorDto[];
}