import { IsNotEmpty, IsInt, IsDateString, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePatientAppointmentDto {
    @IsInt()
    @IsNotEmpty()
    clinicId: number;

    @IsDateString()
    @IsNotEmpty()
    appointmentDate: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsInt()
    duration?: number;

    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsBoolean()
    isVideo?: boolean;

    @IsOptional()
    @IsString()
    type?: string;
}

export class CancelAppointmentDto {
    @IsOptional()
    @IsString()
    reason?: string;
}
