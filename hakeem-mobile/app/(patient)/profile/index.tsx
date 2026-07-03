import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { ScreenHeader, Input, Button, Card, useToast, Toast } from '../../../src/components/common';
import { useAuthStore } from '../../../src/store/auth.store';

export default function ProfileScreen() {
  const { patientUser } = useAuthStore() as any;
  const { toast, show, hide } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: patientUser?.fullName || patientUser?.name || '',
    phone: patientUser?.phone || '',
    age: '28',
    bloodType: 'O+',
    insurance: 'التعاونية للتأمين',
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      show('تم تحديث بياناتك بنجاح', 'success');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="الملف الشخصي" showBack />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{form.name.charAt(0) || 'م'}</Text>
             <TouchableOpacity style={styles.editAvatarBtn}>
               <Ionicons name="camera" size={16} color={colors.white} />
             </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          <Input 
            label="الاسم الكامل" 
            value={form.name} 
            onChangeText={(t) => setForm({...form, name: t})} 
            icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary}/>}
          />
          <View style={{ height: 16 }} />
          <Input 
            label="رقم الهاتف" 
            value={form.phone} 
            onChangeText={(t) => setForm({...form, phone: t})} 
            icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary}/>}
            keyboardType="phone-pad"
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>المعلومات الطبية (اختياري)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input 
                label="العمر" 
                value={form.age} 
                onChangeText={(t) => setForm({...form, age: t})} 
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input 
                label="فصيلة الدم" 
                value={form.bloodType} 
                onChangeText={(t) => setForm({...form, bloodType: t})} 
              />
            </View>
          </View>
          <View style={{ height: 16 }} />
          <Input 
            label="شركة التأمين" 
            value={form.insurance} 
            onChangeText={(t) => setForm({...form, insurance: t})} 
            icon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary}/>}
          />
        </Card>

        <Button title="حفظ التعديلات" onPress={handleSave} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginVertical: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.primary,
  },
  avatarText: { fontFamily: 'Cairo-Bold', fontSize: 36, color: colors.primary },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.accent,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  card: { padding: 16 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 16 },
});
