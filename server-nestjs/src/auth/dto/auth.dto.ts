import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail, IsNotEmpty, IsString, MinLength,
    IsOptional, Matches, ValidatorConstraint,
    ValidatorConstraintInterface, ValidationArguments, Validate
} from 'class-validator';

// ─────────────────────────────────────────────
// Custom Validator: تطابق كلمة المرور
// ─────────────────────────────────────────────
@ValidatorConstraint({ name: 'MatchPasswords', async: false })
export class MatchPasswords implements ValidatorConstraintInterface {
    validate(confirmPassword: string, args: ValidationArguments) {
        const obj = args.object as any;
        return confirmPassword === obj.password;
    }
    defaultMessage() {
        return 'كلمة المرور وتأكيد كلمة المرور غير متطابقين';
    }
}

// ─────────────────────────────────────────────
// LoginDto
// ─────────────────────────────────────────────
export class LoginDto {
    @ApiProperty({ example: 'doctor@clinic.com', required: true })
    @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
    @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
    email: string;

    @ApiProperty({ example: 'Password123', required: true, minLength: 6 })
    @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
    @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
    @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
    password: string;
}

// ─────────────────────────────────────────────
// RegisterDto — آمن: لا يقبل role أو أي حقل خطر
// ─────────────────────────────────────────────
export class RegisterDto {
    @ApiProperty({ example: 'doctor@clinic.com', required: true })
    @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
    @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
    email: string;

    @ApiProperty({ example: 'Password123', required: true, minLength: 8 })
    @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
    @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
    @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم على الأقل',
    })
    password: string;

    @ApiProperty({ example: 'Password123', required: true })
    @IsString({ message: 'تأكيد كلمة المرور يجب أن يكون نصاً' })
    @IsNotEmpty({ message: 'تأكيد كلمة المرور مطلوب' })
    @Validate(MatchPasswords)
    confirmPassword: string;

    @ApiProperty({ example: '0791234567', required: true })
    @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
    @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
    @Matches(/^(\+962|00962|962|0)?7[789]\d{7}$/, {
        message: 'رقم الهاتف يجب أن يكون رقم أردني صحيح (مثال: 0791234567 أو +962791234567)',
    })
    phone: string;

    @ApiProperty({ example: 'د. أحمد محمد', required: false })
    @IsOptional()
    @IsString({ message: 'الاسم يجب أن يكون نصاً' })
    @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
    name?: string;
}

// ─────────────────────────────────────────────
// UpdateProfileDto
// ─────────────────────────────────────────────
export class UpdateProfileDto {
    @ApiProperty({ example: 'د. أحمد محمد', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'doctor@clinic.com', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
    email?: string;

    @ApiProperty({ example: '0791234567', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^(\+962|00962|962|0)?7[789]\d{7}$/, {
        message: 'رقم الهاتف يجب أن يكون رقم أردني صحيح',
    })
    phone?: string;

    @ApiProperty({ example: 'NewPassword123', required: false })
    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم على الأقل',
    })
    password?: string;
}

// ─────────────────────────────────────────────
// AuthResponseDto
// ─────────────────────────────────────────────
export class AuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    access_token: string;

    @ApiProperty({ type: 'object', additionalProperties: true })
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        subscriptionStatus: string;
        expiryDate?: Date;
    };
}
