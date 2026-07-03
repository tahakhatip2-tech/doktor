import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'waiting' | string;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'في الانتظار', color: colors.warning, bg: colors.warningBg },
  confirmed: { label: 'مؤكد', color: colors.primary, bg: colors.statusConfirmedBg },
  completed: { label: 'مكتمل', color: colors.success, bg: colors.successBg },
  cancelled: { label: 'ملغي', color: colors.error, bg: colors.errorBg },
  waiting: { label: 'في الانتظار', color: colors.statusWaiting, bg: `${colors.statusWaiting}15` },
  dispensed: { label: 'مصروف', color: colors.success, bg: colors.successBg },
  sent: { label: 'مرسل', color: colors.info, bg: colors.infoBg },
  active: { label: 'نشط', color: colors.success, bg: colors.successBg },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: colors.textSecondary,
    bg: 'rgba(255,255,255,0.05)',
  };

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <View style={[styles.glow, { backgroundColor: config.color }]} />
      
      {/* Badge itself */}
      <View
        style={[
          styles.badge,
          { backgroundColor: config.bg, borderColor: `${config.color}30` },
          size === 'sm' && styles.badgeSm,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: config.color, shadowColor: config.color }]} />
        <Text style={[styles.label, { color: config.color }, size === 'sm' && styles.labelSm]}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  glow: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
    borderRadius: 20,
    opacity: 0.15,
    shadowColor: 'currentColor',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 11,
  },
});
