// ==========================================
// 🎨 نظام الألوان المحسّن — هوية احترافية عصرية
// ==========================================
export const colors = {
  // الألوان الأساسية — نبضة التطبيق
  primary: '#6C63FF',        // بنفسجي مميز (Indigo)
  primaryDark: '#5A52D5',
  primaryLight: '#8B82FF',
  primaryGlow: 'rgba(108, 99, 255, 0.15)',

  accent: '#F97316',         // برتقالي دافئ
  accentDark: '#EA580C',
  accentLight: '#FB923C',
  accentGlow: 'rgba(249, 115, 22, 0.15)',

  // ألوان البوابات
  doctorColor: '#6C63FF',    // بنفسجي للطبيب
  patientColor: '#F97316',   // برتقالي للمريض
  pharmacyColor: '#10B981',  // أخضر للصيدلية

  // خلفيات عميقة
  background: '#080E1A',     // خلفية داكنة جداً
  backgroundCard: '#0F172A', // خلفية البطاقة
  surface: '#111827',        // سطح أساسي
  surfaceMid: '#1A2234',     // سطح وسط
  surfaceLight: '#1E293B',   // سطح فاتح
  surfaceLighter: '#263348', // سطح أكثر فتحاً
  card: '#141D2E',           // بطاقة

  // حدود وخطوط
  border: '#1E2D45',
  borderLight: '#253553',
  borderGlow: 'rgba(108, 99, 255, 0.3)',

  // النصوص
  textMain: '#F0F4FF',
  textSecondary: '#8899BB',
  textMuted: '#4A6080',
  textInverted: '#080E1A',

  // الحالات
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  successGlow: 'rgba(16, 185, 129, 0.25)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  info: '#38BDF8',
  infoBg: 'rgba(56, 189, 248, 0.1)',

  // حالات المواعيد
  statusPending: '#F59E0B',
  statusPendingBg: 'rgba(245, 158, 11, 0.12)',
  statusConfirmed: '#6C63FF',
  statusConfirmedBg: 'rgba(108, 99, 255, 0.12)',
  statusCompleted: '#10B981',
  statusCompletedBg: 'rgba(16, 185, 129, 0.12)',
  statusCancelled: '#EF4444',
  statusCancelledBg: 'rgba(239, 68, 68, 0.12)',
  statusWaiting: '#8B5CF6',

  // تدرجات
  gradientStart: '#6C63FF',
  gradientEnd: '#4FACFE',

  // ثوابت
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // شفافيات زجاجية
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(8, 14, 26, 0.85)',
} as const;

export type ColorKey = keyof typeof colors;
