import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator,
  StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../src/theme/colors';
import { AppHeader, useToast, Toast } from '../../../src/components/common';
import { medicalRecordsApi } from '../../../src/api/modules.api';
import { MedicalRecord } from '../../../src/types/clinic.types';
import { getErrorMessage } from '../../../src/api/client';

const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || '';

function getLogoUri(avatar?: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return `${API_BASE}${avatar}`;
}

export default function MedicalRecordDetailScreen() {
  const { id, record: recordParam } = useLocalSearchParams();
  const router = useRouter();
  const { toast, show, hide } = useToast();

  const [record, setRecord] = useState<MedicalRecord | null>(() => {
    if (recordParam) {
      try { return JSON.parse(decodeURIComponent(recordParam as string)); } catch { return null; }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!record);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  useEffect(() => {
    if (record) return;
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      setIsLoading(true);
      const res = await medicalRecordsApi.getAll();
      const all = Array.isArray(res.data) ? res.data : [];
      const found = all.find((r: any) => r.id === Number(id));
      setRecord(found || null);
      if (!found) show('لم يتم العثور على السجل', 'error');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiAdvice = async () => {
    if (!record || record.aiAdvice) return;
    try {
      setIsLoadingAdvice(true);
      const res = await medicalRecordsApi.getById(record.id);
      const advice = res.data?.advice || res.data?.aiAdvice;
      if (advice) setRecord(prev => prev ? { ...prev, aiAdvice: advice } : null);
    } catch {
      show('تعذّر جلب نصيحة الذكاء الاصطناعي', 'error');
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!record) return null;

  // ── استخراج البيانات ──
  const appt = record.appointment;
  const user = appt?.user;
  const clinicName  = user?.clinic_name  || appt?.clinic?.clinic_name  || 'عيادة طبية';
  const specialty   = user?.clinic_specialty || appt?.clinic?.clinic_specialty || '';
  const clinicPhone = user?.clinic_phone || '';
  const clinicAddr  = user?.clinic_address || '';
  const doctorName  = appt?.assignedDoctor?.name || user?.name || '';
  const prescriptions = appt?.prescriptions || [];

  const visitDate = appt?.appointmentDate
    ? new Date(appt.appointmentDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(record.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  const visitTime = appt?.appointmentDate
    ? new Date(appt.appointmentDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    : '';

  const typeLabel: Record<string, string> = {
    consultation: 'استشارة', followup: 'متابعة',
    checkup: 'فحص دوري', emergency: 'طارئ',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="تفاصيل الزيارة" showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero: بطاقة العيادة ── */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#0d1b40', '#1a3166']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.heroClinicIcon}>
            <Ionicons name="medical" size={28} color={colors.primary} />
          </View>
          <Text style={styles.heroClinicName}>{clinicName}</Text>
          {specialty ? (
            <View style={styles.heroSpecialtyChip}>
              <Text style={styles.heroSpecialtyText}>{specialty}</Text>
            </View>
          ) : null}

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.6)" />
              <Text style={styles.heroMetaText}>{visitDate}</Text>
            </View>
            {visitTime ? (
              <View style={styles.heroMetaItem}>
                <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.heroMetaText}>{visitTime}</Text>
              </View>
            ) : null}
            {appt?.type ? (
              <View style={styles.heroMetaItem}>
                <Ionicons name="pulse-outline" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.heroMetaText}>{typeLabel[appt.type] || appt.type}</Text>
              </View>
            ) : null}
          </View>

          {/* أزرار التواصل */}
          {(clinicPhone || clinicAddr) ? (
            <View style={styles.heroActions}>
              {clinicPhone ? (
                <TouchableOpacity
                  style={styles.heroActionBtn}
                  onPress={() => Linking.openURL(`tel:${clinicPhone}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={styles.heroActionText}>اتصال</Text>
                </TouchableOpacity>
              ) : null}
              {clinicAddr ? (
                <TouchableOpacity
                  style={[styles.heroActionBtn, { backgroundColor: 'rgba(108,99,255,0.85)' }]}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(clinicAddr)}`)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location" size={16} color="#fff" />
                  <Text style={styles.heroActionText}>الموقع</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* ── معلومات الطبيب ── */}
        {doctorName ? (
          <InfoCard icon="person-circle-outline" iconColor={colors.accent} title="الطبيب المعالج">
            <Text style={styles.bodyText}>{doctorName}</Text>
          </InfoCard>
        ) : null}

        {/* ── التشخيص ── */}
        {record.diagnosis ? (
          <InfoCard icon="clipboard-outline" iconColor={colors.primary} title="التشخيص">
            <Text style={styles.bodyText}>{record.diagnosis}</Text>
          </InfoCard>
        ) : null}

        {/* ── العلاج / الوصفة ── */}
        {record.treatment ? (
          <InfoCard icon="flask-outline" iconColor={colors.success} title="العلاج والوصفة الطبية">
            <Text style={styles.bodyText}>{record.treatment}</Text>
          </InfoCard>
        ) : null}

        {/* ── الوصفات المصروفة ── */}
        {prescriptions.length > 0 ? (
          <InfoCard icon="receipt-outline" iconColor="#8b5cf6" title="الوصفات الطبية">
            {prescriptions.map((p: any, i: number) => (
              <View key={p.id} style={[styles.prescriptionRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 10, marginTop: 6 }]}>
                <View style={styles.prescriptionStatus}>
                  <View style={[styles.statusDot, { backgroundColor: p.status === 'dispensed' ? colors.success : colors.accent }]} />
                  <Text style={styles.prescriptionStatusText}>
                    {p.status === 'dispensed' ? 'تم الصرف' : p.status === 'pending' ? 'بانتظار الصرف' : p.status}
                  </Text>
                </View>
                {p.medications ? <Text style={styles.prescriptionMeds}>{p.medications}</Text> : null}
                {p.pharmacy?.clinic_name || p.pharmacy?.name ? (
                  <View style={styles.prescriptionPharmacy}>
                    <Ionicons name="storefront-outline" size={13} color={colors.textSecondary} />
                    <Text style={styles.prescriptionPharmacyText}>{p.pharmacy?.clinic_name || p.pharmacy?.name}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </InfoCard>
        ) : null}

        {/* ── إجازة مرضية ── */}
        {record.sickLeaveDays ? (
          <InfoCard icon="bed-outline" iconColor="#f59e0b" title="الإجازة المرضية">
            <Text style={styles.bodyText}>{record.sickLeaveDays} أيام</Text>
            {record.sickLeaveReason ? <Text style={[styles.bodyText, { marginTop: 4, color: colors.textSecondary }]}>{record.sickLeaveReason}</Text> : null}
          </InfoCard>
        ) : null}

        {/* ── إحالة ── */}
        {record.referralTo ? (
          <InfoCard icon="arrow-redo-outline" iconColor={colors.info} title="إحالة إلى">
            <Text style={styles.bodyText}>{record.referralTo}</Text>
          </InfoCard>
        ) : null}

        {/* ── رسوم الكشف ── */}
        {record.feeAmount != null && Number(record.feeAmount) > 0 ? (
          <View style={[styles.card, { backgroundColor: `${colors.success}0d`, borderColor: `${colors.success}30` }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: `${colors.success}20` }]}>
                <Ionicons name="cash-outline" size={18} color={colors.success} />
              </View>
              <Text style={styles.cardTitle}>رسوم الكشف</Text>
            </View>
            <Text style={styles.feeAmount}>{record.feeAmount} دينار</Text>
          </View>
        ) : null}

        {/* ── نصيحة الذكاء الاصطناعي ── */}
        <View style={[styles.card, { borderColor: `${colors.accent}40` }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.accent}15` }]}>
              <Ionicons name="sparkles" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.accent }]}>نصيحة الذكاء الاصطناعي</Text>
          </View>

          {record.aiAdvice ? (
            <Text style={styles.bodyText}>{record.aiAdvice}</Text>
          ) : (
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={fetchAiAdvice}
              disabled={isLoadingAdvice}
              activeOpacity={0.8}
            >
              {isLoadingAdvice ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
              )}
              <Text style={styles.aiBtnText}>
                {isLoadingAdvice ? 'جارٍ التحليل...' : 'احصل على نصيحة طبية'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

function InfoCard({ icon, iconColor, title, children }: {
  icon: any; iconColor: string; title: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  center: { flex: 1, backgroundColor: '#f0f4ff', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  // Hero
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#0d1b40',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroClinicIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(108,99,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(108,99,255,0.4)',
    marginBottom: 4,
  },
  heroClinicName: {
    fontFamily: 'Cairo-Bold', fontSize: 20, color: '#fff', textAlign: 'center',
  },
  heroSpecialtyChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroSpecialtyText: {
    fontFamily: 'Cairo-Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)',
  },
  heroMetaRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 10, marginTop: 4,
  },
  heroMetaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  heroMetaText: {
    fontFamily: 'Cairo-Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)',
  },
  heroActions: {
    flexDirection: 'row', gap: 12, marginTop: 8,
  },
  heroActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroActionText: {
    fontFamily: 'Cairo-SemiBold', fontSize: 13, color: '#fff',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain,
  },
  bodyText: {
    fontFamily: 'Cairo-Regular', fontSize: 14,
    color: colors.textSecondary, lineHeight: 24,
  },

  // Fee
  feeAmount: {
    fontFamily: 'Cairo-Bold', fontSize: 26,
    color: colors.success, textAlign: 'center', paddingVertical: 4,
  },

  // Prescription
  prescriptionRow: { gap: 6 },
  prescriptionStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  prescriptionStatusText: {
    fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textMain,
  },
  prescriptionMeds: {
    fontFamily: 'Cairo-Regular', fontSize: 13,
    color: colors.textSecondary, lineHeight: 20,
  },
  prescriptionPharmacy: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  prescriptionPharmacyText: {
    fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary,
  },

  // AI
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12,
    backgroundColor: `${colors.accent}10`,
    borderRadius: 12, borderWidth: 1, borderColor: `${colors.accent}30`,
  },
  aiBtnText: {
    fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.accent,
  },
});
