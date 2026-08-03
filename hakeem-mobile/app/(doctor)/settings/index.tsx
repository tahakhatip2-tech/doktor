import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/auth.store';
import { colors } from '../../../src/theme/colors';
import { Button, AppHeader, Input, Card, ConfirmModal, useToast, Toast } from '../../../src/components/common';
import { apiClient } from '../../../src/api/client';
import { getErrorMessage } from '../../../src/api/client';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface WorkDay {
  day: string;
  isOpen: boolean;
  from: string;
  to: string;
}

export default function DoctorSettingsScreen() {
  const router = useRouter();
  const { doctorUser, logout } = useAuthStore() as any;
  const { toast, show, hide } = useToast();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'hours'>('info');
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    clinicName: doctorUser?.clinic_name || doctorUser?.name || '',
    specialty: doctorUser?.clinic_specialty || '',
    phone: doctorUser?.clinic_phone || doctorUser?.phone || '',
    address: doctorUser?.clinic_address || '',
    description: doctorUser?.description || '',
    price: doctorUser?.metadata?.price || '',
  });

  const [workDays, setWorkDays] = useState<WorkDay[]>(
    DAYS.map(day => ({
      day,
      isOpen: !['الجمعة', 'السبت'].includes(day),
      from: '09:00',
      to: '17:00',
    }))
  );

  const handleSaveInfo = async () => {
    try {
      setIsSaving(true);
      await apiClient.put('/users/clinic-settings', {
        clinic_name: form.clinicName,
        clinic_specialty: form.specialty,
        clinic_phone: form.phone,
        clinic_address: form.address,
        description: form.description,
        metadata: { price: form.price },
      });
      show('تم حفظ بيانات العيادة بنجاح', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHours = async () => {
    try {
      setIsSaving(true);
      await apiClient.put('/users/working-hours', { workDays });
      show('تم حفظ ساعات العمل بنجاح', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (index: number) => {
    setWorkDays(prev => prev.map((d, i) => i === index ? { ...d, isOpen: !d.isOpen } : d));
  };

  const updateTime = (index: number, field: 'from' | 'to', value: string) => {
    setWorkDays(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="إعدادات العيادة" showBack={false} />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => setActiveTab('info')}
        >
          <Ionicons name="storefront-outline" size={18} color={activeTab === 'info' ? colors.white : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>بيانات العيادة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hours' && styles.tabActive]}
          onPress={() => setActiveTab('hours')}
        >
          <Ionicons name="time-outline" size={18} color={activeTab === 'hours' ? colors.white : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'hours' && styles.tabTextActive]}>ساعات العمل</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {activeTab === 'info' ? (
          <>
            {/* Doctor Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{doctorUser?.name?.[0] || 'د'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>د. {doctorUser?.name || 'طبيب'}</Text>
                <Text style={styles.email}>{doctorUser?.email || ''}</Text>
              </View>
            </View>

            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>معلومات العيادة</Text>
              <Input label="اسم العيادة" value={form.clinicName} onChangeText={v => setForm({ ...form, clinicName: v })}
                icon={<Ionicons name="medical-outline" size={20} color={colors.textSecondary} />} />
              <View style={{ height: 12 }} />
              <Input label="التخصص الطبي" value={form.specialty} onChangeText={v => setForm({ ...form, specialty: v })}
                icon={<Ionicons name="ribbon-outline" size={20} color={colors.textSecondary} />} />
              <View style={{ height: 12 }} />
              <Input label="رقم الهاتف" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })}
                keyboardType="phone-pad"
                icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />} />
              <View style={{ height: 12 }} />
              <Input label="العنوان" value={form.address} onChangeText={v => setForm({ ...form, address: v })}
                icon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />} />
              <View style={{ height: 12 }} />
              <Input label="سعر الكشفية (دينار)" value={form.price} onChangeText={v => setForm({ ...form, price: v })}
                keyboardType="numeric"
                icon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />} />
            </Card>

            <Button title="حفظ البيانات" onPress={handleSaveInfo} loading={isSaving} style={{ marginBottom: 8 }} />
          </>
        ) : (
          <>
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>أيام وساعات العمل</Text>
              {workDays.map((day, index) => (
                <View key={day.day} style={styles.dayRow}>
                  <TouchableOpacity
                    style={[styles.dayToggle, day.isOpen && styles.dayToggleActive]}
                    onPress={() => toggleDay(index)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.toggleDot, day.isOpen && styles.toggleDotActive]} />
                  </TouchableOpacity>
                  <Text style={[styles.dayName, !day.isOpen && styles.dayNameOff]}>{day.day}</Text>
                  {day.isOpen ? (
                    <View style={styles.timeInputs}>
                      <View style={styles.timeField}>
                        <Text style={styles.timeLabel}>من</Text>
                        <TouchableOpacity style={styles.timeBtn}>
                          <Text style={styles.timeBtnText}>{day.from}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.timeSep}>—</Text>
                      <View style={styles.timeField}>
                        <Text style={styles.timeLabel}>إلى</Text>
                        <TouchableOpacity style={styles.timeBtn}>
                          <Text style={styles.timeBtnText}>{day.to}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.closedText}>مغلق</Text>
                  )}
                </View>
              ))}
            </Card>

            <Button title="حفظ ساعات العمل" onPress={handleSaveHours} loading={isSaving} style={{ marginBottom: 8 }} />
          </>
        )}

        <Button
          title="تسجيل الخروج"
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={20} color={colors.white} />}
          onPress={() => setLogoutModalVisible(true)}
        />
      </ScrollView>

      <ConfirmModal
        visible={logoutModalVisible}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج من حساب العيادة؟"
        confirmText="نعم، تسجيل خروج"
        cancelText="تراجع"
        confirmVariant="danger"
        onConfirm={() => { setLogoutModalVisible(false); logout(); }}
        onClose={() => setLogoutModalVisible(false)}
      />

      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: 'row', margin: 16, backgroundColor: colors.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center', marginLeft: 14, borderWidth: 1.5, borderColor: colors.primary },
  avatarText: { fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.primary },
  profileInfo: { flex: 1 },
  name: { fontFamily: 'Cairo-Bold', fontSize: 17, color: colors.textMain },
  email: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  card: { padding: 16, marginBottom: 16 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 16 },
  dayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: 10 },
  dayToggle: { width: 40, height: 22, borderRadius: 11, backgroundColor: colors.surfaceLight, justifyContent: 'center', paddingHorizontal: 2, borderWidth: 1, borderColor: colors.borderLight },
  dayToggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.textMuted },
  toggleDotActive: { backgroundColor: colors.white, alignSelf: 'flex-end' },
  dayName: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textMain, width: 70 },
  dayNameOff: { color: colors.textMuted },
  timeInputs: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeField: { alignItems: 'center', gap: 2 },
  timeLabel: { fontFamily: 'Cairo-Regular', fontSize: 10, color: colors.textMuted },
  timeBtn: { backgroundColor: colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.borderLight },
  timeBtnText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textMain },
  timeSep: { color: colors.textMuted, fontSize: 16, marginTop: 14 },
  closedText: { flex: 1, fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textMuted, textAlign: 'left' },
});
