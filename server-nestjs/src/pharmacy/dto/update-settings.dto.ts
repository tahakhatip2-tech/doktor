import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePharmacySettingsDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string | null;

    @IsString()
    @IsOptional()
    clinic_phone?: string | null;

    @IsString()
    @IsOptional()
    clinic_address?: string | null;

    @IsString()
    @IsOptional()
    clinic_specialty?: string | null;

    @IsString()
    @IsOptional()
    working_hours?: string | null;

    @IsString()
    @IsOptional()
    avatar?: string | null;

    @IsString()
    @IsOptional()
    clinic_name?: string;
}
