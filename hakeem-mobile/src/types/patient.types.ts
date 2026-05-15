// =====================
// أنواع بيانات المريض
// =====================

export interface Patient {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  address?: string;
  nationalId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface RegisterPatientDto {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface LoginPatientDto {
  email: string;
  password: string;
}

export interface UpdatePatientProfileDto {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  address?: string;
}

export interface PatientAuthResponse {
  token: string;
  patient: Patient;
}
