import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterNasabahDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(255)
    password: string;

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