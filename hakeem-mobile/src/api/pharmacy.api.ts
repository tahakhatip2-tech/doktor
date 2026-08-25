import { apiClient } from './client';

// ============================
// Interfaces
// ============================

export interface PharmacyPrescription {
  id: number;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED' | 'pending' | 'dispensed' | 'cancelled';
  medications?: string;
  notes?: string;
  createdAt: string;
  dispensedAt?: string;
  patient?: {
    id: number;
    fullName: string;
    phone: string;
    gender?: string;
  };
  doctor?: {
    id: number;
    name: string;
    clinic_name?: string;
    clinic_specialty?: string;
    clinic_logo?: string;
  };
  // legacy fields (mapped from old API)
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  specialty?: string;
  date?: string;
  items?: PrescriptionItem[];
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  duration: string;
  type?: string;
  frequency?: string;
  inStock?: boolean;
}

export interface PharmacyDashboardStats {
  totalPrescriptions: number;
  dispensedPrescriptions: number;
  pendingPrescriptions: number;
  todayPrescriptions: number;
}

// ── نظام المحاسبة - قابل للتوسع لنظام الفوترة الوطني الأردني ──
export interface PharmacyInvoice {
  id: number;
  invoiceNumber: string;       // رقم الفاتورة (سيُستخدم لاحقاً مع نظام الفوترة الوطني)
  prescriptionId?: number;
  patientName: string;
  patientNationalId?: string;  // الرقم الوطني - مطلوب للفوترة الوطنية
  doctorName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  insuranceCoverage: number;   // تغطية التأمين
  patientShare: number;        // حصة المريض
  total: number;
  paymentMethod: 'cash' | 'insurance' | 'card' | 'mixed';
  insuranceCompany?: string;   // شركة التأمين
  insuranceNumber?: string;    // رقم وثيقة التأمين
  status: 'draft' | 'paid' | 'cancelled' | 'refunded';
  createdAt: string;
  // حقول الفوترة الوطنية الأردنية (للتطوير المستقبلي)
  nationalInvoiceId?: string;  // رقم الفاتورة في النظام الوطني
  nationalInvoiceStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  qrCode?: string;             // QR code للفاتورة الوطنية
}

export interface InvoiceItem {
  id?: number;
  name: string;
  type: string;
  quantity: number;
  unitPrice: number;
  total: number;
  barcode?: string;            // باركود الدواء
  registrationNumber?: string; // رقم تسجيل الدواء في وزارة الصحة
}

export interface FinancialSummary {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  cashRevenue: number;
  insuranceRevenue: number;
  cardRevenue: number;
  todayRevenue: number;
  growthPercent?: number;
}

// ============================
// Pharmacy Dashboard API
// ============================
export const pharmacyDashboardApi = {
  getStats: () =>
    apiClient.get<PharmacyDashboardStats>('/pharmacy/dashboard'),
};

// ============================
// Pharmacy Prescriptions API
// ============================
export const pharmacyPrescriptionsApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    apiClient.get<PharmacyPrescription[]>('/pharmacy/prescriptions', { params }),

  getById: (id: number) =>
    apiClient.get<PharmacyPrescription>(`/pharmacy/prescriptions/${id}`),

  dispense: (id: number) =>
    apiClient.patch(`/pharmacy/prescriptions/${id}/dispense`),
};

// ============================
// Pharmacy Financial API
// (جاهز للربط بنظام الفوترة الوطني الأردني)
// ============================
export const pharmacyFinancialApi = {
  // جلب ملخص مالي
  getSummary: (period: 'day' | 'week' | 'month') =>
    apiClient.get<FinancialSummary>('/pharmacy/financial/summary', { params: { period } }),

  // جلب الفواتير
  getInvoices: (params?: { period?: string; status?: string; page?: number }) =>
    apiClient.get<PharmacyInvoice[]>('/pharmacy/financial/invoices', { params }),

  // إنشاء فاتورة جديدة
  createInvoice: (data: Partial<PharmacyInvoice>) =>
    apiClient.post<PharmacyInvoice>('/pharmacy/financial/invoices', data),

  // تحديث فاتورة
  updateInvoice: (id: number, data: Partial<PharmacyInvoice>) =>
    apiClient.patch<PharmacyInvoice>(`/pharmacy/financial/invoices/${id}`, data),

  // إلغاء فاتورة
  cancelInvoice: (id: number) =>
    apiClient.patch(`/pharmacy/financial/invoices/${id}/cancel`),

  // إرسال للنظام الوطني (للتطوير المستقبلي)
  submitToNationalSystem: (id: number) =>
    apiClient.post(`/pharmacy/financial/invoices/${id}/submit-national`),
};
