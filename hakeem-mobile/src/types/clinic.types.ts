// =====================
// أنواع بيانات العيادة
// =====================

export interface Clinic {
  id: number;
  clinic_name?: string;
  clinic_phone?: string;
  clinic_address?: string;
  clinic_logo?: string;
  clinic_specialty?: string;
  working_hours?: string;
  name?: string;
  email?: string;
  // إحصائيات
  averageRating?: number;
  reviewsCount?: number;
  doctorsCount?: number;
}

export interface ClinicDoctor {
  id: number;
  clinicId: number;
  name: string;
  specialty?: string;
  phone?: string;
  workingHours?: string;
  isActive: boolean;
}

export interface ClinicReview {
  id: number;
  clinicId: number;
  patientId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  patient?: {
    fullName: string;
    avatar?: string;
  };
}

// =====================
// أنواع بيانات الإشعارات
// =====================

export interface PatientNotification {
  id: number;
  patientId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  appointmentId?: number;
  createdAt: string;
  readAt?: string;
}

// =====================
// أنواع بيانات السجلات الطبية
// =====================

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  diagnosis?: string;
  treatment?: string;
  aiAdvice?: string;
  recordType: string;
  feeAmount?: number;
  createdAt: string;
  appointment?: {
    appointmentDate: string;
    clinic?: {
      clinic_name?: string;
      clinic_specialty?: string;
    };
    assignedDoctor?: {
      name: string;
    };
  };
}

// =====================
// أنواع بيانات العروض
// =====================

export interface Offer {
  id: number;
  userId: number;
  title: string;
  content: string;
  image?: string;
  isPermanent: boolean;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
  clinic?: {
    clinic_name?: string;
    clinic_logo?: string;
  };
}

// =====================
// أنواع بيانات المحادثة الداخلية
// =====================

export type SenderType = 'PATIENT' | 'DOCTOR' | 'BOT';

export interface InternalMessage {
  id: number;
  conversationId: number;
  content: string;
  senderType: SenderType;
  senderId?: number;
  isRead: boolean;
  createdAt: string;
}
