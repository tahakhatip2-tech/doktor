import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/store/auth.store';
import { colors } from '../../../src/theme/colors';
import { Button, AppHeader, Input, Card, ConfirmModal, useToast, Toast } from '../../../src/components/common';
import { apiClient, getErrorMessage } from '../../../src/api/client';

export default function PharmacySettingsScreen() {
  const { pharmacyUser, logout } = useAuthStore() as any;
  const { toast, show, hide } = useToast();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: pharmacyUser?.name || '',
    phone: pharmacyUser?.phone || '',
    address: pharmacyUser?.clinic_address || '',
    licenseNumber: pharmacyUser?.licenseNumber || '',
    openTime: '08:00',
    closeTime: '22:00',
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put('/users/clinic-settings', {
        clinic_name: form.name,
        clinic_phone: form.phone,
        clinic_address: form.address,
        metadata: {
          licenseNumber: form.licenseNumber,
          openTime: form.openTime,
          closeTime: form.closeTime,
        },
      });
      show('تم حفظ بيانات الصيدلية بنجاح', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="إعدادات الصيدلية" showBack={false} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>💊</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{pharmacyUser?.name || 'صيدلية حكيم'}</Text>
            <Text style={styles.email}>{pharmacyUser?.email || ''}</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>بيانات الصيدلية</Text>
          <Input label="اسم الصيدلية" value={form.name} onChangeText={v => setForm({ ...form, name: v })}
            icon={<Ionicons name="storefront-outline" size={20} color={colors.textSecondary} />} />
          <View style={{ height: 12 }} />
          <Input label="رقم الهاتف" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
            icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />} />
          <View style={{ height: 12 }} />
          <Input label="العنوان" value={form.address} onChangeText={v => setForm({ ...form, address: v })}
            icon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />} />
          <View style={{ height: 12 }} />
          <Input label="رقم الترخيص" value={form.licenseNumber} onChangeText={v => setForm({ ...form, licenseNumber: v })}
            icon={<Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>ساعات العمل</Text>
          <View style={styles.hoursRow}>
            <View style={styles.hourField}>
              <Text style={styles.hourLabel}>وقت الفتح</Text>
              <View style={styles.hourInput}>
                <Ionicons name="sunny-outline" size={16} color={colors.success} />
                <Text style={styles.hourText}>{form.openTime}</Text>
              </View>
            </View>
            <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
            <View style={styles.hourField}>
              <Text style={styles.hourLabel}>وقت الإغلاق</Text>
              <View style={styles.hourInput}>
                <Ionicons name="moon-outline" size={16} color={colors.primary} />
                <Text style={styles.hourText}>{form.closeTime}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Button title="حفظ البيانات" onPress={handleSave} loading={isSaving} style={{ marginBottom: 8 }} />

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
        message="هل أنت متأكد أنك تريد تسجيل الخروج من حساب الصيدلية؟"
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
  scroll: { padding: 16, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: `${colors.success}15`, justifyContent: 'center', alignItems: 'center', marginLeft: 14, borderWidth: 1.5, borderColor: colors.success },
  avatarEmoji: { fontSize: 26 },
  profileInfo: { flex: 1 },
  name: { fontFamily: 'Cairo-Bold', fontSize: 17, color: colors.textMain },
  email: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  card: { padding: 16, marginBottom: 16 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 16 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hourField: { alignItems: 'center', gap: 8 },
  hourLabel: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary },
  hourInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight },
  hourText: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
});
