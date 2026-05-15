export const colors = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B84FF',
  secondary: '#38BDF8',
  secondaryDark: '#0EA5E9',

  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  surfaceLighter: '#475569',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  border: '#334155',
  borderLight: '#475569',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // حالات المواعيد
  statusPending: '#F59E0B',
  statusConfirmed: '#3B82F6',
  statusCompleted: '#10B981',
  statusCancelled: '#EF4444',
} as const;

export type ColorKey = keyof typeof colors;
