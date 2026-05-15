// =====================
// أنواع بيانات المواعيد
// =====================

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentType = 'consultation' | 'followup' | 'checkup' | 'emergency';

export interface Appointment {
  id: number;
  userId?: number;
  phone: string;
  customerName?: string;
  appointmentDate: string;
  status: AppointmentStatus;
  notes?: string;
  duration: number;
  type: AppointmentType;
  cancellationReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  // علاقات
  clinic?: {
    id: number;
    clinic_name?: string;
    clinic_specialty?: string;
    clinic_address?: string;
    clinic_logo?: string;
    clinic_phone?: string;
  };
  assignedDoctor?: {
    id: number;
    name: string;
    specialty?: string;
  };
}

export interface CreateAppointmentDto {
  clinicId: number;
  appointmentDate: string;
  notes?: string;
  type?: AppointmentType;
  doctorId?: number;
}

export interface CancelAppointmentDto {
  reason: string;
}

export interface AppointmentStats {
  today_total: number;
  today_completed: number;
  today_waiting: number;
  today_cancelled: number;
  attendance_rate: number;
}
