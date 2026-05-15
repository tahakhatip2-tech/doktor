import { AppointmentStatus } from '../types/appointment.types';

// =====================
// تنسيق التواريخ
// =====================

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-JO', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-JO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} - ${formatTime(dateString)}`;
};

export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isFuture = (dateString: string): boolean => {
  return new Date(dateString) > new Date();
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return formatDateShort(dateString);
};

// =====================
// تنسيق حالات المواعيد - عربي
// =====================

export const getStatusLabel = (status: AppointmentStatus): string => {
  const map: Record<AppointmentStatus, string> = {
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  };
  return map[status] || status;
};

export const getStatusColor = (status: AppointmentStatus): string => {
  const map: Record<AppointmentStatus, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    completed: '#10B981',
    cancelled: '#EF4444',
  };
  return map[status] || '#94A3B8';
};

// =====================
// تنسيق الأرقام
// =====================

export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} د.أ`;
};

export const formatPhone = (phone: string): string => {
  // تحويل أرقام الهاتف الأردنية
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('962')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+962${cleaned.slice(1)}`;
  return phone;
};
