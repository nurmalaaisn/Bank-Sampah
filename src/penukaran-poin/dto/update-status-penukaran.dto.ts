import {
    IsIn,
    IsString,
} from 'class-validator';

export class UpdateStatusPenukaranDto {
    @IsString()
    @IsIn([
        'diproses',
        'selesai',
    ])
    status: string;
}