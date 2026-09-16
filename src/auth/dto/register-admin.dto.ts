import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAdminDto {
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
  namaUnit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  namaPengelola: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  telp: string;
}