import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateAppointmentDto {
    @ApiProperty({
        description: 'رقم هاتف المريض',
        example: '+962791234567',
        required: true,
    })
    phone: string;

    @ApiPropertyOptional({
        description: 'اسم المريض',
        example: 'أحمد محمد',
    })
    customerName?: string;

    @ApiProperty({
        description: 'تاريخ ووقت الموعد',
        example: '2026-01-15T10:00:00.000Z',
        type: 'string',
        format: 'date-time',
    })
    appointmentDate: string | Date;

    @ApiPropertyOptional({
        description: 'حالة الموعد',
        example: 'confirmed',
        enum: ['confirmed', 'pending', 'cancelled', 'completed'],
        default: 'confirmed',
    })
    status?: string;

    @ApiPropertyOptional({
        description: 'ملاحظات إضافية',
        example: 'موعد فحص دوري',
    })
    notes?: string;

    @ApiPropertyOptional({
        description: 'معرف المريض في النظام',
        example: 1,
        type: 'number',
    })
    patientId?: number;

    @ApiPropertyOptional({
        description: 'مدة الموعد بالدقائق',
        example: 30,
        type: 'number',
        default: 30,
    })
    duration?: number;

    @ApiPropertyOptional({
        description: 'نوع الموعد',
        example: 'consultation',
        enum: ['consultation', 'follow-up', 'emergency', 'checkup'],
        default: 'consultation',
    })
    type?: string;
}

export class UpdateAppointmentDto {
    @ApiPropertyOptional({
        description: 'رقم هاتف المريض',
        example: '+962791234567',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'اسم المريض',
        example: 'أحمد محمد',
    })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiPropertyOptional({
        description: 'تاريخ ووقت الموعد',
        example: '2026-01-15T10:00:00.000Z',
        type: 'string',
        format: 'date-time',
    })
    @IsOptional()
    @IsDateString()
    appointmentDate?: string | Date;

    @ApiPropertyOptional({
        description: 'حالة الموعد',
        example: 'confirmed',
        enum: ['confirmed', 'pending', 'cancelled', 'completed', 'scheduled'],
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({
        description: 'ملاحظات إضافية',
        example: 'تم تأجيل الموعد',
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({
        description: 'مدة الموعد بالدقائق',
        example: 45,
        type: 'number',
    })
    @IsOptional()
    @IsNumber()
    duration?: number;

    @ApiPropertyOptional({
        description: 'نوع الموعد',
        example: 'follow-up',
        enum: ['consultation', 'follow-up', 'emergency', 'checkup'],
    })
    @IsOptional()
    @IsString()
    type?: string;
}

export class SaveMedicalRecordDto {
    @ApiPropertyOptional({
        description: 'التشخيص الطبي',
        example: 'التهاب في الحلق',
    })
    diagnosis?: string;

    @ApiPropertyOptional({
        description: 'العلاج الموصوف',
        example: 'مضاد حيوي + مسكن للألم',
    })
    treatment?: string;

    @ApiPropertyOptional({
        description: 'عمر المريض',
        example: '35',
    })
    age?: string;

    @ApiPropertyOptional({
        description: 'قيمة الفاتورة',
        example: 50.00,
        type: 'number',
    })
    feeAmount?: number;

    @ApiPropertyOptional({
        description: 'تفاصيل الفاتورة',
        example: 'كشف + أدوية',
    })
    feeDetails?: string;

    @ApiPropertyOptional({
        description: 'رابط المرفقات',
        example: '/uploads/prescription-123.pdf',
    })
    attachmentUrl?: string;

    @ApiPropertyOptional({
        description: 'نوع السجل الطبي',
        example: 'prescription',
        enum: ['prescription', 'lab_report', 'sick_leave', 'referral'],
        default: 'prescription',
    })
    recordType?: string;
}

export class AppointmentResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: '+962791234567' })
    phone: string;

    @ApiProperty({ example: 'أحمد محمد' })
    customerName: string;

    @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
    appointmentDate: Date;

    @ApiProperty({ example: 'confirmed' })
    status: string;

    @ApiProperty({ example: 'موعد فحص دوري', required: false })
    notes?: string;

    @ApiProperty({ example: 30 })
    duration: number;

    @ApiProperty({ example: 'consultation' })
    type: string;

    @ApiProperty({ example: '2026-01-13T08:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-01-13T08:00:00.000Z' })
    updatedAt: Date;
}
