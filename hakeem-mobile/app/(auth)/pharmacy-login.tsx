import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { pharmacyAuthApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح').min(1, 'مطلوب'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});
type FormData = z.infer<typeof schema>;

export default function PharmacyLoginScreen() {
  const router = useRouter();
  const loginAsPharmacy = useAuthStore((s) => s.loginAsPharmacy);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await pharmacyAuthApi.login(data);
      const token = res.data?.token || res.data?.session?.access_token;
      const user = res.data?.user || res.data?.pharmacy;
      if (token && user) {
        await loginAsPharmacy(token, user);
      } else {
        Alert.alert('خطأ', 'بيانات الدخول غير مكتملة');
      }
    } catch (e) {
      Alert.alert('خطأ', getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={[s.backText, { fontFamily: 'Cairo-Bold' }]}>عودة ➔</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <View style={s.icon}><Text style={{ fontSize: 32 }}>💊</Text></View>
            <Text style={[s.title, { fontFamily: 'Cairo-Bold' }]}>دخول الصيدليات</Text>
            <Text style={[s.sub, { fontFamily: 'Cairo-Regular' }]}>أدخل بيانات حسابك للوصول لنظام الصيدلية</Text>
          </View>

          <View style={s.form}>
            <View>
              <Text style={[s.label, { fontFamily: 'Cairo-SemiBold' }]}>البريد الإلكتروني للصيدلية</Text>
              <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[s.input, { fontFamily: 'Cairo-Regular' }]} placeholder="pharmacy@example.com" placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
              {errors.email && <Text style={[s.err, { fontFamily: 'Cairo-Regular' }]}>{errors.email.message}</Text>}
            </View>

            <View>
              <Text style={[s.label, { fontFamily: 'Cairo-SemiBold' }]}>كلمة المرور</Text>
              <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[s.input, { fontFamily: 'Cairo-Regular' }]} placeholder="••••••••" placeholderTextColor={colors.textSecondary} secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
              {errors.password && <Text style={[s.err, { fontFamily: 'Cairo-Regular' }]}>{errors.password.message}</Text>}
            </View>

            <TouchableOpacity style={[s.btn, isLoading && s.disabled]} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={[s.btnText, { fontFamily: 'Cairo-Bold' }]}>تسجيل الدخول</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  back: { position: 'absolute', top: 12, left: 6, padding: 8, zIndex: 10 },
  backText: { color: colors.textSecondary, fontSize: 14 },
  header: { alignItems: 'center', marginBottom: 40 },
  icon: { width: 80, height: 80, borderRadius: 20, backgroundColor: `${colors.success}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, color: colors.textMain, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  form: { gap: 16 },
  label: { fontSize: 15, color: colors.textMain, textAlign: 'right', marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: colors.textMain, textAlign: 'right', fontSize: 15 },
  err: { fontSize: 13, color: colors.error, textAlign: 'right', marginTop: 4 },
  btn: { backgroundColor: colors.success, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontSize: 17 },
});
