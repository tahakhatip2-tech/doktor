// أنواع استجابات API المشتركة
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Doctor / User types  
export interface DoctorUser {
  id: number;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER' | 'AGENT';
  clinic_name?: string;
  clinic_phone?: string;
  clinic_address?: string;
  clinic_logo?: string;
  clinic_specialty?: string;
  working_hours?: string;
  auto_reply_enabled?: boolean;
  subscriptionStatus: 'FREE' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
}

export interface LoginDoctorDto {
  email: string;
  password: string;
}

export interface DoctorAuthResponse {
  token?: string;
  user: DoctorUser;
  session?: any;
}
