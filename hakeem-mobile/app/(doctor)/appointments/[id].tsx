import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ScreenHeader, StatusBadge, Button, useToast, Toast,
  CompleteModal, PreliminaryExamsModal,
} from '../../../src/components/common';
import { colors } from '../../../src/theme/colors';
import { doctorAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || '';

function getAvatarUri(avatar?: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return `${API_BASE}${avatar}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '؟';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DoctorAppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [isExamsModalVisible, setIsExamsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchAppointment(); }, [id]);

  const fetchAppointment = async () => {
    try {
      setIsLoading(true);
      const res = await doctorAppointmentsApi.getById(Number(id));
      setAppointment(res.data);
    } catch {
      showToast('حدث خطأ أثناء جلب بيانات الموعد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await doctorAppointmentsApi.updateStatus(Number(id), 'confirmed');
      showToast('تم تأكيد الموعد بنجاح!', 'success');
      setAppointment(prev => prev ? { ...prev, status: 'confirmed' as any } : null);
    } catch {
      showToast('حدث خطأ أثناء تأكيد الموعد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPreliminaryExams = async (data: { initialTests: string; medicalProcedures: string }) => {
    try {
      setIsSubmitting(true);
      await doctorAppointmentsApi.updateProcedures(Number(id), data);
      setIsExamsModalVisible(false);
      showToast('تم حفظ الفحوصات الأولية بنجاح!', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ الفحوصات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (data: {
    diagnosis: string; treatment: string; feeAmount: string;
    feeDetails?: string; nationalId?: string; age?: string;
    medications?: any[];
    sickLeaveDays?: string; sickLeaveReason?: string;
    referralTo?: string; referralReason?: string;
  }) => {
    try {
      setIsSubmitting(true);
      await doctorAppointmentsApi.complete(Number(id), {
        ...data,
        feeAmount: Number(data.feeAmount),
      });
      setIsCompleteModalVisible(false);
      showToast('تم إتمام الموعد بنجاح!', 'success');
      setAppointment(prev => prev ? { ...prev, status: 'completed' as any } : null);
    } catch {
      showToast('حدث خطأ أثناء إتمام الموعد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>لم يتم العثور على الموعد</Text>
        <Button title="عودة" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const patientName = appointment.patientUser?.fullName || appointment.contact?.name || appointment.customerName || 'مريض غير معروف';
  const patientPhone = appointment.patientUser?.phone || appointment.contact?.phone || appointment.phone || 'غير متوفر';
  const avatarUri = getAvatarUri(appointment.patientUser?.avatar);
  const initials = getInitials(patientName);
  const chatPatientId = appointment.patientUserId || appointment.patientUser?.id || appointment.patientId || appointment.contact?.id;
  const appointmentDate = new Date(appointment.appointmentDate);

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: colors.primary,
    completed: '#10b981',
    cancelled: colors.error,
  };
  const accentColor = statusColors[appointment.status] || colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="تفاصيل الموعد" showBack />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero Card: صورة المريض + الاسم + الحالة ── */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#0d1b40', '#1a3166']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={[`${accentColor}cc`, `${accentColor}66`]} style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
          </View>

          {/* Name + meta */}
          <Text style={styles.heroName}>{patientName}</Text>
          <View style={styles.heroMeta}>
            <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.heroPhone}>{patientPhone}</Text>
          </View>

          {/* Status + Date row */}
          <View style={styles.heroBadgeRow}>
            <StatusBadge status={appointment.status} />
            <View style={styles.heroDateChip}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroDateText}>
                {appointmentDate.toLocaleDateString('ar-SA')}
              </Text>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroDateText}>
                {appointmentDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroActionBtn}
              onPress={() => Linking.openURL(`tel:${patientPhone}`)}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.heroActionText}>اتصال</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.heroActionBtn, { backgroundColor: 'rgba(108,99,255,0.9)' }]}
              onPress={() => {
                if (!chatPatientId) return;
                router.push({
                  pathname: '/(doctor)/chat',
                  params: { patientId: chatPatientId, patientName: encodeURIComponent(patientName) },
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
              <Text style={styles.heroActionText}>مراسلة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── تفاصيل الموعد ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>تفاصيل الموعد</Text>
          </View>
          <InfoRow icon="medical-outline" label="نوع الموعد" value={
            appointment.type === 'followup' ? 'متابعة' :
            appointment.type === 'checkup' ? 'فحص دوري' :
            appointment.type === 'emergency' ? 'طارئ' : 'استشارة'
          } />
          <InfoRow icon="time-outline" label="المدة" value={`${appointment.duration} دقيقة`} />
          {appointment.assignedDoctor && (
            <InfoRow icon="person-outline" label="الطبيب المعالج" value={appointment.assignedDoctor.name} />
          )}
        </View>

        {/* ── ملاحظات المريض ── */}
        {appointment.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbox-outline" size={20} color={colors.accent} />
              <Text style={styles.cardTitle}>ملاحظات المريض</Text>
            </View>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* ── أزرار تغيير الحالة ── */}
        {appointment.status === 'pending' && (
          <Button
            title="تأكيد الموعد"
            onPress={handleConfirm}
            loading={isSubmitting}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
          />
        )}

        {appointment.status === 'confirmed' && (
          <View style={styles.actionsRow}>
            <Button
              title="فحوصات أولية"
              variant="outline"
              onPress={() => setIsExamsModalVisible(true)}
              style={{ flex: 1 }}
              icon={<Ionicons name="medical-outline" size={18} color={colors.primary} />}
            />
            <Button
              title="إتمام العلاج"
              onPress={() => setIsCompleteModalVisible(true)}
              style={{ flex: 2 }}
              icon={<Ionicons name="checkmark-done" size={20} color="#fff" />}
            />
          </View>
        )}

      </ScrollView>

      <CompleteModal
        visible={isCompleteModalVisible}
        onClose={() => setIsCompleteModalVisible(false)}
        onSubmit={handleComplete}
        isLoading={isSubmitting}
        patientName={patientName}
        appointmentId={appointment.id}
      />
      <PreliminaryExamsModal
        visible={isExamsModalVisible}
        onClose={() => setIsExamsModalVisible(false)}
        onSubmit={submitPreliminaryExams}
        isLoading={isSubmitting}
      />
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  errorText: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.error },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },

  // Hero Card
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#0d1b40',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarInitials: {
    fontFamily: 'Cairo-Bold',
    fontSize: 32,
    color: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#0d1b40',
  },
  heroName: {
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroPhone: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  heroDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroDateText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroActionText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: '#fff',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
    color: colors.textMain,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: colors.textMain,
    textAlign: 'left',
  },
  notesBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'left',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
