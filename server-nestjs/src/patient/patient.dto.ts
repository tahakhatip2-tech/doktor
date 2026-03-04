import { IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsEmail } from 'class-validator';

export class RegisterPatientDto {
  @IsOptional()
  @IsEmail()
  email?: string; // Optional — auto-generated from phone if not provided

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class LoginPatientDto {
  @IsString()
  @IsNotEmpty()
  phone: string; // Login with phone number

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdatePatientProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
