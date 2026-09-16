import {
    IsNotEmpty,
    IsUUID,
} from 'class-validator';

export class CreatePenukaranPoinDto {
    @IsUUID()
    @IsNotEmpty()
    hadiahId: string;
}