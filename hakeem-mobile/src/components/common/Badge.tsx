import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../../theme/colors';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: colors.infoBg, text: colors.primary },
  accent: { bg: colors.warningBg, text: colors.accent },
  success: { bg: colors.successBg, text: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning },
  error: { bg: colors.errorBg, text: colors.error },
  info: { bg: colors.infoBg, text: colors.info },
  muted: { bg: colors.surfaceLight, text: colors.textSecondary },
};

export function Badge({ label, variant = 'primary', size = 'md' }: BadgeProps) {
  const { bg, text } = variantMap[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, { color: text }, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
}

// مكون خاص لحالة الموعد
export function AppointmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'قيد الانتظار', variant: 'warning' },
    confirmed: { label: 'مؤكد', variant: 'primary' },
    completed: { label: 'مكتمل', variant: 'success' },
    cancelled: { label: 'ملغي', variant: 'error' },
    waiting: { label: 'في الانتظار', variant: 'info' },
    scheduled: { label: 'مجدول', variant: 'primary' },
  };
  const config = map[status] || { label: status, variant: 'muted' as BadgeVariant };
  return <Badge label={config.label} variant={config.variant} size="sm" />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    textAlign: 'center',
  },
  textSm: {
    fontSize: 11,
  },
});
