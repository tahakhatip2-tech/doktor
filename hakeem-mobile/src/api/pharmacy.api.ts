import { apiClient } from './client';

export interface PharmacyPrescription {
  id: number;
  patientName: string;
  patientId?: string;
  doctorName: string;
  specialty?: string;
  date: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  notes?: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  duration: string;
  inStock?: boolean;
}

// ============================
// Pharmacy Prescriptions API
// ============================
export const pharmacyPrescriptionsApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    apiClient.get<PharmacyPrescription[]>('/pharmacy/prescriptions', { params }),

  getById: (id: number) =>
    apiClient.get<PharmacyPrescription>(`/pharmacy/prescriptions/${id}`),

  dispense: (id: number) =>
    apiClient.put(`/pharmacy/prescriptions/${id}/dispense`),
};
