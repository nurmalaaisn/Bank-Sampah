import {
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateNasabahDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    namaNasabah: string;

    @IsString()
    @IsNotEmpty()
    alamat: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    telp: string;
}