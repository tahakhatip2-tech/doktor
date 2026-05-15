import { apiClient } from './client';
import { Clinic, PatientNotification, MedicalRecord, Offer, InternalMessage } from '../types/clinic.types';

// ============================
// Clinics API (Patient)
// ============================
export const clinicsApi = {
  getAll: (params?: { specialty?: string; search?: string }) =>
    apiClient.get<Clinic[]>('/patient/clinics', { params }),

  getById: (id: number) =>
    apiClient.get<Clinic>(`/patient/clinics/${id}`),
};

// ============================
// Notifications API (Patient)
// ============================
export const notificationsApi = {
  getAll: () =>
    apiClient.get<PatientNotification[]>('/patient/notifications'),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/patient/notifications/unread-count'),

  markAsRead: (id: number) =>
    apiClient.put(`/patient/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put('/patient/notifications/read-all'),
};

// ============================
// Medical Records API (Patient)
// ============================
export const medicalRecordsApi = {
  getAll: () =>
    apiClient.get<MedicalRecord[]>('/patient/medical-records'),

  getById: (id: number) =>
    apiClient.get<MedicalRecord>(`/patient/medical-records/${id}`),
};

// ============================
// Offers API (Patient)
// ============================
export const offersApi = {
  getAll: () =>
    apiClient.get<Offer[]>('/patient/offers'),

  like: (id: number) =>
    apiClient.post(`/patient/offers/${id}/like`),

  unlike: (id: number) =>
    apiClient.delete(`/patient/offers/${id}/like`),
};

// ============================
// Chat API (Patient ↔ Clinic)
// ============================
export const chatApi = {
  getMessages: (clinicId: number) =>
    apiClient.get<InternalMessage[]>(`/patient/chat/${clinicId}/messages`),

  sendMessage: (clinicId: number, content: string) =>
    apiClient.post<InternalMessage>(`/patient/chat/${clinicId}/messages`, { content }),
};

// ============================
// Contacts API (Doctor)
// ============================
export const contactsApi = {
  getAll: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get('/contacts', { params }),

  getById: (id: number) =>
    apiClient.get(`/contacts/${id}`),

  delete: (id: number) =>
    apiClient.delete(`/contacts/${id}`),

  sync: () =>
    apiClient.post('/contacts/sync'),
};

// ============================
// WhatsApp Settings API (Doctor)
// ============================
export const whatsappApi = {
  getSettings: () =>
    apiClient.get('/whatsapp/settings'),

  updateSettings: (data: any) =>
    apiClient.put('/whatsapp/settings', data),

  getChats: () =>
    apiClient.get('/whatsapp/chats'),

  getChatMessages: (chatId: number) =>
    apiClient.get(`/whatsapp/chats/${chatId}/messages`),

  sendMessage: (chatId: number, message: string) =>
    apiClient.post(`/whatsapp/chats/${chatId}/messages`, { message }),
};

// ============================
// Templates API (Doctor)
// ============================
export const templatesApi = {
  getAll: () =>
    apiClient.get('/templates'),

  create: (data: any) =>
    apiClient.post('/templates', data),

  update: (id: number, data: any) =>
    apiClient.put(`/templates/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/templates/${id}`),
};
