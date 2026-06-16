// ==========================================
// 🎨 نظام الألوان — نفس هوية الويب تماماً
// ==========================================
export const colors = {
  // الألوان الأساسية
  primary: '#2563EB',       // الأزرق الأساسي
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  accent: '#F97316',        // البرتقالي المميز
  accentDark: '#EA580C',
  accentLight: '#FB923C',

  // خلفيات
  background: '#0F172A',    // الخلفية الداكنة
  surface: '#1E293B',       // سطح البطاقات
  surfaceLight: '#334155',
  surfaceLighter: '#475569',
  card: '#1E293B',

  // النصوص
  textMain: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverted: '#0F172A',

  // الحالات
  success: '#10B981',
  successBg: '#064E3B',
  warning: '#F59E0B',
  warningBg: '#78350F',
  error: '#EF4444',
  errorBg: '#7F1D1D',
  info: '#3B82F6',
  infoBg: '#1E3A8A',

  // الحدود
  border: '#334155',
  borderLight: '#475569',

  // حالات المواعيد
  statusPending: '#F59E0B',
  statusConfirmed: '#2563EB',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',
  statusWaiting: '#8B5CF6',

  // ثوابت
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
