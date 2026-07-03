import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { doctorAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { Button, StatusBadge, AppHeader, ConfirmModal, useToast, Toast, Card, Input } from '../../../src/components/common';
import { getErrorMessage } from '../../../src/api/client';
import { formatDate, formatTime } from '../../../src/utils/format.utils';

export default function DoctorAppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [prescription, setPrescription] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setIsLoading(true);
      const res = await doctorAppointmentsApi.getById(Number(id));
      setAppointment(res.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setTimeout(() => router.back(), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      setIsUpdating(true);
      const data: any = { status: newStatus };
      if (newStatus === 'completed' && prescription.trim()) {
        data.prescription = prescription;
      }

      await doctorAppointmentsApi.update(Number(id), data);
      
      // Close all modals
      setConfirmVisible(false);
      setCancelVisible(false);
      setCompleteVisible(false);
      
      showToast('تم تحديث حالة الموعد بنجاح', 'success');
      fetchAppointment();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsUpdating(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="تفاصيل الموعد" showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Patient Profile Summary */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
             <Text style={styles.avatarEmoji}>🧑</Text>
          </View>
          <Text style={styles.patientName}>{appointment.customerName || 'مريض غير مسجل'}</Text>
          <Text style={styles.patientPhone}>{appointment.phone}</Text>
          
          <TouchableOpacity 
            style={styles.viewRecordBtn}
            onPress={() => router.push(`/(doctor)/patients/${(appointment as any).customerId || 1}` as any)}
          >
            <Text style={styles.viewRecordText}>عرض السجل الطبي</Text>
            <Ionicons name="document-text" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Section */}
        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardTitle}>الحالة الحالية:</Text>
            <StatusBadge status={appointment.status} size="md" />
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>تاريخ الموعد</Text>
              <Text style={styles.infoValue}>{formatDate(appointment.appointmentDate)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.accent}15` }]}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.infoLabel}>الوقت المجدول</Text>
              <Text style={styles.infoValue}>{formatTime(appointment.appointmentDate)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.success}15` }]}>
              <Ionicons name="medical-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={styles.infoLabel}>نوع الزيارة</Text>
              <Text style={styles.infoValue}>
                {appointment.type === 'consultation' ? 'استشارة' : appointment.type === 'followup' ? 'مراجعة' : 'أخرى'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Patient Notes */}
        {appointment.notes && (
          <View style={styles.notesBox}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMain} />
              <Text style={styles.notesTitle}>ملاحظات المريض:</Text>
            </View>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}
        
        {/* Prescription (If exists) */}
        {(appointment as any).prescription && (
          <Card style={[styles.card, { borderColor: colors.success, borderWidth: 1.5 }] as any}>
            <View style={[styles.notesHeader, { marginBottom: 8 }]}>
              <Ionicons name="flask" size={20} color={colors.success} />
              <Text style={[styles.notesTitle, { color: colors.success }]}>الوصفة الطبية المصروفة:</Text>
            </View>
            <Text style={styles.notesText}>{(appointment as any).prescription}</Text>
          </Card>
        )}

      </ScrollView>

      {/* Action Buttons (Footer) */}
      <View style={styles.footer}>
        {appointment.status === 'pending' && (
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              <Button title="تأكيد" onPress={() => setConfirmVisible(true)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="رفض" variant="danger" onPress={() => setCancelVisible(true)} />
            </View>
          </View>
        )}

        {appointment.status === 'confirmed' && (
          <View style={styles.footerRow}>
            <View style={{ flex: 2 }}>
              <Button 
                title="إتمام وتوثيق الوصفة" 
                style={{ backgroundColor: colors.success, borderColor: colors.success }}
                icon={<Ionicons name="checkmark-done" size={20} color={colors.white} />}
                onPress={() => setCompleteVisible(true)} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button 
                title="إلغاء" 
                variant="outline"
                onPress={() => setCancelVisible(true)} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Modals */}
      <ConfirmModal
        visible={confirmVisible}
        title="تأكيد الموعد"
        message="هل أنت متأكد أنك تريد تأكيد هذا الموعد؟ سيتم إشعار المريض بذلك."
        confirmText="نعم، تأكيد"
        onConfirm={() => handleUpdateStatus('confirmed')}
        onClose={() => setConfirmVisible(false)}
        loading={isUpdating}
      />

      <ConfirmModal
        visible={cancelVisible}
        title="إلغاء الموعد"
        message="هل أنت متأكد من إلغاء هذا الموعد؟ يرجى التواصل مع المريض في حال كان الإلغاء طارئاً."
        confirmText="نعم، إلغاء الموعد"
        confirmVariant="danger"
        onConfirm={() => handleUpdateStatus('cancelled')}
        onClose={() => setCancelVisible(false)}
        loading={isUpdating}
      />

      <ConfirmModal
        visible={completeVisible}
        title="إتمام الموعد والوصفة الطبية"
        message="الرجاء إدخال تفاصيل الوصفة الطبية أو ملاحظات التشخيص للمريض قبل إتمام الموعد."
        confirmText="إتمام وحفظ الوصفة"
        confirmVariant="primary"
        onConfirm={() => handleUpdateStatus('completed')}
        onClose={() => setCompleteVisible(false)}
        loading={isUpdating}
      >
        <Input
          label="الوصفة الطبية / التشخيص"
          placeholder="اكتب هنا الأدوية أو التشخيص النهائي..."
          value={prescription}
          onChangeText={setPrescription}
          multiline
          style={{ height: 100, marginTop: 12 }}
        />
      </ConfirmModal>

      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.info}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 36 },
  patientName: { fontFamily: 'Cairo-Bold', fontSize: 20, color: colors.textMain, marginBottom: 4 },
  patientPhone: { fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.textSecondary },
  viewRecordBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: `${colors.primary}15`, borderRadius: 20 },
  viewRecordText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.primary },
  card: { padding: 20, marginBottom: 24 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary },
  infoValue: { fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textMain },
  notesBox: { backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.borderLight },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  notesTitle: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain },
  notesText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, lineHeight: 24 },
  footer: { padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  footerRow: { flexDirection: 'row', gap: 12 },
});
