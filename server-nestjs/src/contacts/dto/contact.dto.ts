import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
    @ApiProperty({ description: 'اسم المريض/جهة الاتصال', example: 'محمد أحمد' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'رقم الهاتف', example: '+962791234567' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({ description: 'الرقم الوطني', example: '9901020304' })
    @IsOptional()
    @IsString()
    nationalId?: string;

    @ApiPropertyOptional({ description: 'البريد الإلكتروني', example: 'patient@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'العنوان/الموقع', example: 'عمان، الأردن' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ description: 'فصيلة الدم', example: 'A+' })
    @IsOptional()
    @IsString()
    bloodType?: string;

    @ApiPropertyOptional({ description: 'الحساسية', example: 'حساسية من البنسلين' })
    @IsOptional()
    @IsString()
    allergies?: string;

    @ApiPropertyOptional({ description: 'الأمراض المزمنة', example: 'السكري' })
    @IsOptional()
    @IsString()
    chronicDiseases?: string;

    @ApiPropertyOptional({ description: 'ملاحظات طبية عامة', example: 'يحتاج لمتابعة دورية' })
    @IsOptional()
    @IsString()
    medicalNotes?: string;
}

export class UpdateContactStatusDto {
    @ApiProperty({ description: 'الحالة الجديدة', example: 'active', enum: ['active', 'inactive', 'blocked'] })
    @IsEnum(['active', 'inactive', 'blocked'])
    status: string;
}


export class ContactResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'محمد أحمد' })
    name: string;

    @ApiProperty({ example: '+962791234567' })
    phone: string;

    @ApiProperty({ example: 'active' })
    status: string;

    @ApiPropertyOptional({ example: '9901020304' })
    nationalId?: string;

    @ApiProperty({ example: 5, description: 'إجمالي عدد المواعيد' })
    total_appointments: number;

    @ApiPropertyOptional({ example: '2026-01-10T10:00:00.000Z', description: 'تاريخ آخر زيارة' })
    last_visit: Date;

    @ApiProperty({ example: 'active', description: 'حالة المريض' })
    patient_status: string;
}
