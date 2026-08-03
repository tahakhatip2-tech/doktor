import { apiClient } from './client';

// ============================
// Patient Profile API
// ============================
export const patientProfileApi = {
  get: () =>
    apiClient.get('/patient/profile'),

  update: (data: { fullName?: string; phone?: string; age?: number; bloodType?: string; insurance?: string }) =>
    apiClient.put('/patient/profile', data),
};

// ============================
// Available Slots API
// ============================
export const slotsApi = {
  getByDate: (clinicId: number, date: string) =>
    apiClient.get<string[]>(`/patient/clinics/${clinicId}/available-slots`, { params: { date } }),
};

// ============================
// Reviews API
// ============================
export const reviewsApi = {
  submit: (clinicId: number, data: { rating: number; comment?: string; appointmentId?: number }) =>
    apiClient.post(`/patient/clinics/${clinicId}/reviews`, data),

  getByClinic: (clinicId: number) =>
    apiClient.get(`/patient/clinics/${clinicId}/reviews`),
};

// ============================
// Chat Conversations API
// ============================
export const conversationsApi = {
  getAll: () =>
    apiClient.get('/patient/chat/conversations'),
};
