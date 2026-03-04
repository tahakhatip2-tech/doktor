import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsUrl } from 'class-validator';

export class WhatsAppSendMessageDto {
    @ApiProperty({ description: 'رقم الهاتف المستلم', example: '962791234567' })
    @IsString()
    phone: string;

    @ApiProperty({ description: 'محتوى الرسالة النصية', example: 'مرحباً بك في عيادة الحكيم' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'رابط الوسائط (صورة، PDF...)', example: 'https://example.com/file.pdf' })
    @IsOptional()
    @IsString()
    mediaUrl?: string;

    @ApiPropertyOptional({ description: 'نوع الوسائط', example: 'document', enum: ['image', 'video', 'audio', 'document'] })
    @IsOptional()
    @IsEnum(['image', 'video', 'audio', 'document'])
    mediaType?: string;
}

export class WhatsAppSettingsDto {
    // ── إعدادات العيادة الأساسية ─────────────────────────────
    @ApiPropertyOptional({ description: 'اسم العيادة', example: 'عيادة الحكيم' })
    @IsOptional()
    @IsString()
    clinic_name?: string;

    @ApiPropertyOptional({ description: 'وصف العيادة' })
    @IsOptional()
    @IsString()
    clinic_description?: string;

    @ApiPropertyOptional({ description: 'رابط شعار العيادة' })
    @IsOptional()
    @IsString()
    clinic_logo?: string;

    @ApiPropertyOptional({ description: 'اسم الطبيب' })
    @IsOptional()
    @IsString()
    doctor_name?: string;

    @ApiPropertyOptional({ description: 'رقم الهاتف الرئيسي' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'رقم الطوارئ' })
    @IsOptional()
    @IsString()
    emergency_phone?: string;

    @ApiPropertyOptional({ description: 'العنوان' })
    @IsOptional()
    @IsString()
    address?: string;

    // ── ساعات العمل والمواعيد ────────────────────────────────
    @ApiPropertyOptional({ description: 'وقت بدء العمل', example: '09:00' })
    @IsOptional()
    @IsString()
    working_hours_start?: string;

    @ApiPropertyOptional({ description: 'وقت انتهاء العمل', example: '17:00' })
    @IsOptional()
    @IsString()
    working_hours_end?: string;

    @ApiPropertyOptional({ description: 'مدة الموعد بالدقائق', example: 30 })
    @IsOptional()
    appointment_duration?: number;

    // ── إعدادات الرد التلقائي والتذكير ──────────────────────
    @ApiPropertyOptional({ description: 'تفعيل الرد التلقائي' })
    @IsOptional()
    auto_reply_enabled?: boolean | string;

    @ApiPropertyOptional({ description: 'تفعيل التذكير' })
    @IsOptional()
    reminder_enabled?: boolean | string;

    @ApiPropertyOptional({ description: 'وقت التذكير (بالدقائق قبل الموعد)' })
    @IsOptional()
    reminder_time?: number;

    // ── إعدادات الذكاء الاصطناعي ────────────────────────────
    @ApiPropertyOptional({ description: 'تفعيل الذكاء الاصطناعي' })
    @IsOptional()
    ai_enabled?: boolean | string;

    @ApiPropertyOptional({ description: 'مفتاح API للذكاء الاصطناعي' })
    @IsOptional()
    @IsString()
    ai_api_key?: string;

    @ApiPropertyOptional({ description: 'تعليمات النظام للذكاء الاصطناعي' })
    @IsOptional()
    @IsString()
    ai_system_instruction?: string;

    // ── حقول قديمة للتوافق مع الإصدار السابق ───────────────
    @ApiPropertyOptional({ description: 'تفعيل الرد التلقائي بالذكاء الاصطناعي (legacy)', example: true })
    @IsOptional()
    @IsBoolean()
    aiEnabled?: boolean;

    @ApiPropertyOptional({ description: 'تفعيل الردود التلقائية العامة (legacy)', example: true })
    @IsOptional()
    @IsBoolean()
    autoReplyEnabled?: boolean;

    @ApiPropertyOptional({ description: 'ساعات العمل بالذكاء الاصطناعي (legacy)', example: '9AM-5PM' })
    @IsOptional()
    @IsString()
    workingHours?: string;
}

export class CreateTemplateDto {
    @ApiProperty({ description: 'كلمة الزناد (Trigger)', example: 'مواعيد' })
    @IsString()
    trigger: string;

    @ApiProperty({ description: 'الرد المبرمج', example: 'أهلاً بك، لحجز موعد يرجى الدخول للرابط التالي...' })
    @IsString()
    response: string;

    @ApiPropertyOptional({ description: 'تفعيل القالب', example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class WhatsAppStatusResponseDto {
    @ApiProperty({ example: true, description: 'حالة الاتصال بالواتساب' })
    connected: boolean;

    @ApiPropertyOptional({ example: 'data:image/png;base64...', description: 'رمز QR للربط' })
    qr?: string;

    @ApiPropertyOptional({ example: '962791234567', description: 'رقم الهاتف المرتبط حالياً' })
    phone?: string;
}
