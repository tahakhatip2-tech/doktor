import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { patientAuthApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const schema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});
type FormData = z.infer<typeof schema>;

export default function PatientRegisterScreen() {
  const router = useRouter();
  const loginAsPatient = useAuthStore((s) => s.loginAsPatient);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', phone: '', email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await patientAuthApi.register(data);
      const { token, patient } = res.data;
      if (token && patient) await loginAsPatient(token, patient);
    } catch (e) {
      Alert.alert('خطأ', getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const fields: Array<{ name: keyof FormData; label: string; placeholder: string; keyboard?: any; secure?: boolean }> = [
    { name: 'fullName', label: 'الاسم الكامل', placeholder: 'الاسم الرباعي' },
    { name: 'phone', label: 'رقم الهاتف', placeholder: '07xxxxxxxx', keyboard: 'phone-pad' },
    { name: 'email', label: 'البريد الإلكتروني', placeholder: 'mail@example.com', keyboard: 'email-address' },
    { name: 'password', label: 'كلمة المرور', placeholder: '••••••••', secure: true },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={[s.backText, { fontFamily: 'Cairo-Bold' }]}>عودة ➔</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <Text style={[s.title, { fontFamily: 'Cairo-Bold' }]}>إنشاء حساب مريض</Text>
            <Text style={[s.sub, { fontFamily: 'Cairo-Regular' }]}>انضم إلينا وابدأ بحجز مواعيدك بسهولة</Text>
          </View>

          <View style={s.form}>
            {fields.map(f => (
              <View key={f.name}>
                <Text style={[s.label, { fontFamily: 'Cairo-SemiBold' }]}>{f.label}</Text>
                <Controller control={control} name={f.name} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[s.input, { fontFamily: 'Cairo-Regular' }]}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={f.keyboard || 'default'}
                    autoCapitalize={f.name === 'email' ? 'none' : 'words'}
                    secureTextEntry={f.secure}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )} />
                {errors[f.name] && <Text style={[s.err, { fontFamily: 'Cairo-Regular' }]}>{errors[f.name]?.message}</Text>}
              </View>
            ))}

            <TouchableOpacity style={[s.btn, isLoading && s.disabled]} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={[s.btnText, { fontFamily: 'Cairo-Bold' }]}>إنشاء حساب</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 16, padding: 4 },
  backText: { color: colors.textSecondary, fontSize: 14 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 24 },
  title: { fontSize: 26, color: colors.textMain, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  form: { gap: 16 },
  label: { fontSize: 15, color: colors.textMain, textAlign: 'right', marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: colors.textMain, textAlign: 'right', fontSize: 15 },
  err: { fontSize: 13, color: colors.error, textAlign: 'right', marginTop: 4 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontSize: 17 },
});
