import { apiClient } from './client';
import { LoginPatientDto, RegisterPatientDto, PatientAuthResponse, UpdatePatientProfileDto, Patient } from '../types/patient.types';
import { LoginDoctorDto } from '../types/api.types';

// ============================
// Patient Auth API
// ============================
export const patientAuthApi = {
  login: (dto: LoginPatientDto) =>
    apiClient.post<PatientAuthResponse>('/patient/auth/login', dto),

  register: (dto: RegisterPatientDto) =>
    apiClient.post<PatientAuthResponse>('/patient/auth/register', dto),

  getProfile: () =>
    apiClient.get<Patient>('/patient/profile'),

  updateProfile: (dto: UpdatePatientProfileDto) =>
    apiClient.put<Patient>('/patient/profile', dto),
};

// ============================
// Doctor Auth API
// ============================
export const doctorAuthApi = {
  login: (dto: LoginDoctorDto) =>
    apiClient.post('/auth/login', dto),

  getMe: () =>
    apiClient.get('/auth/me'),
};

// ============================
// Pharmacy Auth API
// ============================
export interface LoginPharmacyDto {
  email: string;
  password: string;
}

export const pharmacyAuthApi = {
  login: (dto: LoginPharmacyDto) =>
    apiClient.post('/pharmacy/auth/login', dto),

  getProfile: () =>
    apiClient.get('/pharmacy/profile'),

  updateProfile: (dto: any) =>
    apiClient.put('/pharmacy/profile', dto),
};
