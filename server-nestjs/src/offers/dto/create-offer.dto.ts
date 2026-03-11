import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateOfferDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsBoolean()
    isPermanent: boolean;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
