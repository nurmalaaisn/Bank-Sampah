import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

import { ItemSetorDto } from './item-setor.dto';

export class CreateSetorSampahDto {
    @IsDateString()
    tanggal: string;

    @IsOptional()
    @IsString()
    catatan?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ItemSetorDto)
    items: ItemSetorDto[];
}