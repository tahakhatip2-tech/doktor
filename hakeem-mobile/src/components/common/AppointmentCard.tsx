import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { StatusBadge } from './StatusBadge';

interface AppointmentCardProps {
  appointment: {
    id: number;
    appointmentDate: string;
    status: string;
    notes?: string;
    type?: string;
    contact?: { name?: string; phone?: string };
    user?: {
      clinic_name?: string;
      name?: string;
      clinic_specialty?: string;
      clinic_logo?: string;
      avatar?: string;
    };
    customerName?: string;
  };
  onPress?: () => void;
  viewAs?: 'patient' | 'doctor' | 'pharmacy';
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${period}`;
  } catch {
    return '';
  }
}

export function AppointmentCard({ appointment, onPress, viewAs = 'patient' }: AppointmentCardProps) {
  const isDoctor = viewAs === 'doctor';

  const mainName = isDoctor
    ? appointment.customerName || appointment.contact?.name || 'مريض'
    : appointment.user?.clinic_name || appointment.user?.name || 'عيادة';

  const subName = isDoctor
    ? appointment.contact?.phone || ''
    : appointment.user?.clinic_specialty || '';

  const initial = mainName.charAt(0);
  const avatarThemeColor = isDoctor ? colors.accent : colors.primary;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.0)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Avatar with glow */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarGlow, { backgroundColor: avatarThemeColor }]} />
        <View style={[styles.avatar, { borderColor: `${avatarThemeColor}40`, backgroundColor: `${avatarThemeColor}15` }]}>
          <Text style={[styles.avatarText, { color: avatarThemeColor }]}>{initial}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {mainName}
          </Text>
          <StatusBadge status={appointment.status} size="sm" />
        </View>

        {subName ? (
          <Text style={styles.specialty} numberOfLines={1}>
            {subName}
          </Text>
        ) : null}

        <View style={styles.timeRow}>
          <View style={styles.timeChip}>
            <Ionicons name="calendar-outline" size={14} color={colors.primaryLight} />
            <Text style={styles.timeText}>{formatDate(appointment.appointmentDate)}</Text>
          </View>
          <View style={styles.timeChip}>
            <Ionicons name="time-outline" size={14} color={colors.accentLight} />
            <Text style={styles.timeText}>{formatTime(appointment.appointmentDate)}</Text>
          </View>
          {appointment.type === 'video-consultation' && (
            <View style={[styles.timeChip, styles.videoChip]}>
              <Ionicons name="videocam-outline" size={14} color={colors.info} />
              <Text style={[styles.timeText, { color: colors.info }]}>فيديو</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 52,
    height: 52,
  },
  avatarGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.4,
    shadowColor: 'currentColor',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    zIndex: 1,
  },
  avatarText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
    flex: 1,
  },
  specialty: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  videoChip: {
    backgroundColor: `${colors.info}10`,
    borderColor: `${colors.info}30`,
  },
  timeText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  chevronContainer: {
    paddingLeft: 4,
  },
});
