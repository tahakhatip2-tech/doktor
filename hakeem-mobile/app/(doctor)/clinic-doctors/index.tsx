import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal as RNModal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { apiClient } from '../../../src/api/client';
import { AppHeader, Toast, useToast } from '../../../src/components/common';

interface ClinicDoctor {
  id: number;
  name: string;
  role: string;
  specialty?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  username?: string;
  workingHours?: string;
}

const roleLabel: Record<string, string> = {
  doctor: 'طبيب',
  secretary: 'سكرتيرة',
  nurse: 'ممرضة',
  admin: 'مدير',
};

const roleColor: Record<string, string> = {
  doctor: colors.primary,
  secretary: colors.info,
  nurse: colors.success,
  admin: colors.warning,
};

export default function ClinicDoctorsScreen() {
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast, show, hide } = useToast();

  const [form, setForm] = useState({
    name: '',
    role: 'doctor',
    specialty: '',
    email: '',
    phone: '',
    username: '',
    password: '',
  });

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/clinic-doctors');
      setDoctors(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchDoctors(); }, [fetchDoctors]));

  const handleAdd = async () => {
    if (!form.name.trim()) {
      show('الاسم مطلوب', 'warning');
      return;
    }
    try {
      await apiClient.post('/clinic-doctors', form);
      show('تم إضافة الطاقم الطبي بنجاح', 'success');
      setShowAddModal(false);
      setForm({ name: '', role: 'doctor', specialty: '', email: '', phone: '', username: '', password: '' });
      await fetchDoctors();
    } catch {
      show('حدث خطأ أثناء الإضافة', 'error');
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'حذف الطاقم الطبي',
      `هل أنت متأكد من حذف "${name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف', style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/clinic-doctors/${id}`);
              show('تم الحذف بنجاح', 'success');
              fetchDoctors();
            } catch {
              show('حدث خطأ أثناء الحذف', 'error');
            }
          },
        },
      ],
    );
  };

  const roles = ['doctor', 'secretary', 'nurse'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="أطباء العيادة والطاقم الطبي" showBack={false} />

      {/* زر الإضافة */}
      <View style={styles.topBar}>
        <Text style={styles.countText}>{doctors.length} عضو</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>إضافة</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={60} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>لا يوجد طاقم طبي</Text>
          <Text style={styles.emptySub}>أضف طبيباً أو موظفاً لبدء العمل</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: `${roleColor[item.role] || colors.primary}20` }]}>
                <Ionicons
                  name={item.role === 'doctor' ? 'medkit' : item.role === 'nurse' ? 'heart' : 'person'}
                  size={26}
                  color={roleColor[item.role] || colors.primary}
                />
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: `${roleColor[item.role] || colors.primary}20` }]}>
                    <Text style={[styles.roleBadgeText, { color: roleColor[item.role] || colors.primary }]}>
                      {roleLabel[item.role] || item.role}
                    </Text>
                  </View>
                </View>
                {item.specialty ? (
                  <Text style={styles.specialty}>{item.specialty}</Text>
                ) : null}
                {item.phone ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.infoText}>{item.phone}</Text>
                  </View>
                ) : null}
                {item.username ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.infoText}>@{item.username}</Text>
                  </View>
                ) : null}
              </View>

              {/* Status + Delete */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? colors.success : colors.error }]} />
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal الإضافة */}
      <RNModal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة طاقم طبي</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[1]}
              keyExtractor={() => 'form'}
              renderItem={() => (
                <View style={{ gap: 14 }}>
                  {/* الاسم */}
                  <View>
                    <Text style={styles.label}>الاسم الكامل *</Text>
                    <TextInput
                      style={styles.input}
                      value={form.name}
                      onChangeText={(v) => setForm(p => ({ ...p, name: v }))}
                      placeholder="د. محمد أحمد"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  {/* الدور */}
                  <View>
                    <Text style={styles.label}>الدور الوظيفي</Text>
                    <View style={styles.rolesRow}>
                      {roles.map(r => (
                        <TouchableOpacity
                          key={r}
                          style={[styles.roleOption, form.role === r && styles.roleOptionActive]}
                          onPress={() => setForm(p => ({ ...p, role: r }))}
                        >
                          <Text style={[styles.roleOptionText, form.role === r && styles.roleOptionTextActive]}>
                            {roleLabel[r]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {form.role === 'doctor' && (
                    <View>
                      <Text style={styles.label}>التخصص</Text>
                      <TextInput
                        style={styles.input}
                        value={form.specialty}
                        onChangeText={(v) => setForm(p => ({ ...p, specialty: v }))}
                        placeholder="طب عام، قلب، أسنان..."
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  )}

                  <View>
                    <Text style={styles.label}>رقم الهاتف</Text>
                    <TextInput
                      style={styles.input}
                      value={form.phone}
                      onChangeText={(v) => setForm(p => ({ ...p, phone: v }))}
                      placeholder="07XXXXXXXX"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View>
                    <Text style={styles.label}>اسم المستخدم (للدخول)</Text>
                    <TextInput
                      style={styles.input}
                      value={form.username}
                      onChangeText={(v) => setForm(p => ({ ...p, username: v }))}
                      placeholder="doctor_ahmed"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  <View>
                    <Text style={styles.label}>كلمة المرور</Text>
                    <TextInput
                      style={styles.input}
                      value={form.password}
                      onChangeText={(v) => setForm(p => ({ ...p, password: v }))}
                      placeholder="كلمة مرور قوية"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>حفظ</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </RNModal>

      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  emptySub: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  countText: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textSecondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  addBtnText: { fontFamily: 'Cairo-Bold', fontSize: 14, color: '#fff' },

  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.borderLight,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  name: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain },
  roleBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  roleBadgeText: { fontFamily: 'Cairo-Bold', fontSize: 11 },
  specialty: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.primary, marginBottom: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textMuted },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  label: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 14, borderWidth: 1,
    borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textMain, textAlign: 'right',
  },
  rolesRow: { flexDirection: 'row', gap: 10 },
  roleOption: {
    flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
    borderColor: colors.borderLight, alignItems: 'center', backgroundColor: colors.surfaceLight,
  },
  roleOptionActive: { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
  roleOptionText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  roleOptionTextActive: { color: colors.primary, fontFamily: 'Cairo-Bold' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  submitBtnText: { fontFamily: 'Cairo-Bold', fontSize: 16, color: '#fff' },
});
