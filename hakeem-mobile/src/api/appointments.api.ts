import { apiClient } from './client';
import { Appointment, CreateAppointmentDto, CancelAppointmentDto, AppointmentStats } from '../types/appointment.types';

export interface FinancialSummary {
  totalRevenue: number;
  appointmentsCount: number;
  pendingPayments: number;
  growthPercent?: number;
}

export interface FinancialTransaction {
  id: number;
  patientName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

// ============================
// Patient Appointments API
// ============================
export const patientAppointmentsApi = {
  getAll: () =>
    apiClient.get<Appointment[]>('/patient/appointments'),

  getUpcoming: () =>
    apiClient.get<Appointment[]>('/patient/appointments/upcoming'),

  getById: (id: number) =>
    apiClient.get<Appointment>(`/patient/appointments/${id}`),

  create: (dto: CreateAppointmentDto) =>
    apiClient.post<Appointment>('/patient/appointments', dto),

  cancel: (id: number, dto: CancelAppointmentDto) =>
    apiClient.delete(`/patient/appointments/${id}`, { data: dto }),
};

// ============================
// Doctor Appointments API
// ============================
export const doctorAppointmentsApi = {
  getAll: (params?: { date_from?: string; date_to?: string; status?: string; contactId?: number }) =>
    apiClient.get<Appointment[]>('/appointments', { params }),

  getById: (id: number) =>
    apiClient.get<Appointment>(`/appointments/${id}`),

  getStats: () =>
    apiClient.get<AppointmentStats>('/appointments/stats'),

  create: (dto: any) =>
    apiClient.post<Appointment>('/appointments', dto),

  update: (id: number, dto: any) =>
    apiClient.patch<Appointment>(`/appointments/${id}`, dto),

  // تغيير حالة الموعد فقط (تأكيد / إلغاء / إكمال)
  updateStatus: (id: number, status: string) =>
    apiClient.patch<Appointment>(`/appointments/${id}/status`, { status }),

  complete: (id: number, data: any) =>
    apiClient.post(`/appointments/${id}/medical-record`, data),

  updateProcedures: (id: number, data: { initialTests?: string; medicalProcedures?: string }) =>
    apiClient.put<Appointment>(`/appointments/${id}/procedures`, data),
};

// ============================
// Financial API (Doctor)
// ============================
export const financialApi = {
  getSummary: (period: 'day' | 'week' | 'month') =>
    apiClient.get<FinancialSummary>('/financial/summary', { params: { period } }),

  getTransactions: (period: 'day' | 'week' | 'month') =>
    apiClient.get<FinancialTransaction[]>('/financial/transactions', { params: { period } }),
};
