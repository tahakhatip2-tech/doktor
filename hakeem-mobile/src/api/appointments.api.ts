import { apiClient } from './client';
import { Appointment, CreateAppointmentDto, CancelAppointmentDto, AppointmentStats } from '../types/appointment.types';

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
    apiClient.put<Appointment>(`/appointments/${id}`, dto),

  delete: (id: number) =>
    apiClient.delete(`/appointments/${id}`),

  complete: (id: number, data: any) =>
    apiClient.post(`/appointments/${id}/complete`, data),
};
