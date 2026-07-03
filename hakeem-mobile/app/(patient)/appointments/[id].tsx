import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { patientAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { getErrorMessage } from '../../../src/api/client';
import { formatDate, formatTime } from '../../../src/utils/format.utils';
import { 
  AppHeader, StatusBadge, Button, 
  ConfirmModal, useToast, Toast, Card
} from '../../../src/components/common';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      // استخدام getAll والبحث، حيث أن الـ API الحالي قد لا يوفر getById للمواعيد
      const res = await patientAppointmentsApi.getAll();
      const found = res.data.find((a: Appointment) => a.id === Number(id));
      if (found) {
        setAppointment(found);
      } else {
        showToast('الموعد غير موجود', 'error');
        setTimeout(() => router.back(), 1500);
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await patientAppointmentsApi.cancel(Number(id), { reason: 'إلغاء من قبل المريض' });
      setCancelModalVisible(false);
      showToast('تم إلغاء الموعد بنجاح', 'success');
      fetchDetails(); // تحديث الحالة لتصبح 'cancelled'
    } catch (err) {
      setCancelModalVisible(false);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!appointment) return null;

  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';
  const isCompleted = appointment.status === 'completed';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="تفاصيل الموعد" showBack />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <StatusBadge status={appointment.status} size="md" />
          <Text style={styles.dateText}>{formatDate(appointment.appointmentDate)}</Text>
          <Text style={styles.timeText}>{formatTime(appointment.appointmentDate)}</Text>
        </View>

        {/* Clinic Info */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>معلومات العيادة</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>اسم العيادة</Text>
            <Text style={styles.infoValue}>{appointment.clinic?.clinic_name || 'عيادة طبية'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الطبيب</Text>
            <Text style={styles.infoValue}>{(appointment.clinic as any)?.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>التخصص</Text>
            <Text style={styles.infoValue}>{appointment.clinic?.clinic_specialty || '-'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.chatBtn}
            onPress={() => router.push(`/(patient)/chat/${(appointment as any).clinicId}` as any)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={styles.chatBtnText}>مراسلة العيادة</Text>
          </TouchableOpacity>
        </Card>

        {/* Appointment Details */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color={colors.accent} />
            <Text style={styles.cardTitle}>تفاصيل الموعد</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>نوع الموعد</Text>
            <Text style={styles.infoValue}>
              {appointment.type === ('video-consultation' as any) ? 'استشارة فيديو' : 'كشف في العيادة'}
            </Text>
          </View>
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>ملاحظاتك وقت الحجز:</Text>
            <Text style={styles.notesValue}>
              {appointment.notes || 'لم تتم إضافة أي ملاحظات.'}
            </Text>
          </View>
        </Card>

        {/* Prescription (If Completed) */}
        {isCompleted && (
          <Card style={[styles.card, { borderColor: colors.success, borderWidth: 1.5 }] as any}>
            <View style={styles.cardHeader}>
              <Ionicons name="flask" size={24} color={colors.success} />
              <Text style={styles.cardTitle}>الوصفة الطبية</Text>
            </View>
            <Text style={styles.infoValue}>
              تم إتمام الموعد وإصدار وصفة طبية. يمكنك عرضها وصرفها من الصيدلية.
            </Text>
            <Button 
              title="عرض الوصفة" 
              variant="outline" 
              style={{ marginTop: 12, borderColor: colors.success }}
              onPress={() => showToast('سيتم عرض الوصفة قريباً', 'info')}
            />
          </Card>
        )}

      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        {canCancel && (
          <Button 
            title="إلغاء الموعد" 
            variant="danger" 
            onPress={() => setCancelModalVisible(true)}
          />
        )}
      </View>

      <ConfirmModal
        visible={cancelModalVisible}
        title="إلغاء الموعد"
        message="هل أنت متأكد أنك تريد إلغاء هذا الموعد نهائياً؟"
        confirmText="نعم، إلغاء الموعد"
        cancelText="تراجع"
        confirmVariant="danger"
        loading={isCancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelModalVisible(false)}
      />

      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  dateText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 22,
    color: colors.textMain,
    marginTop: 12,
  },
  timeText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: colors.textMain,
    textAlign: 'left',
    flex: 1,
    paddingRight: 16,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 12,
  },
  chatBtnText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  notesBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
  },
  notesLabel: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  notesValue: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textMain,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
