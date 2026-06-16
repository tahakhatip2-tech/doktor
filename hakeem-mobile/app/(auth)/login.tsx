import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doctorAuthApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح').min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function DoctorLoginScreen() {
  const router = useRouter();
  const loginAsDoctor = useAuthStore((state) => state.loginAsDoctor);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await doctorAuthApi.login(data);
      const token = response.data?.token || response.data?.session?.access_token;
      const user = response.data?.user;

      if (token && user) {
        await loginAsDoctor(token, user);
      } else {
        Alert.alert('خطأ', 'بيانات الدخول غير مكتملة');
      }
    } catch (error) {
      Alert.alert('خطأ في تسجيل الدخول', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { fontFamily: 'Cairo-Bold' }]}>عودة ➔</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Text style={{ fontSize: 32 }}>👨‍⚕️</Text>
            </View>
            <Text style={[styles.title, { fontFamily: 'Cairo-Bold' }]}>دخول العيادات</Text>
            <Text style={[styles.subtitle, { fontFamily: 'Cairo-Regular' }]}>أدخل بيانات حسابك للوصول لنظام حكيم</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { fontFamily: 'Cairo-SemiBold' }]}>البريد الإلكتروني</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { fontFamily: 'Cairo-Regular' }]}
                    placeholder="example@clinic.com"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text style={[styles.errorText, { fontFamily: 'Cairo-Regular' }]}>{errors.email.message}</Text>}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={[styles.label, { fontFamily: 'Cairo-SemiBold' }]}>كلمة المرور</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { fontFamily: 'Cairo-Regular' }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text style={[styles.errorText, { fontFamily: 'Cairo-Regular' }]}>{errors.password.message}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.submitText, { fontFamily: 'Cairo-Bold' }]}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backButton: { position: 'absolute', top: 12, left: 6, padding: 8, zIndex: 10 },
  backText: { color: colors.textSecondary, fontSize: 14 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 28, color: colors.textMain, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  formContainer: { gap: 16 },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 15, color: colors.textMain, textAlign: 'right' },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    color: colors.textMain, textAlign: 'right', fontSize: 15,
  },
  errorText: { fontSize: 13, color: colors.error, textAlign: 'right' },
  submitButton: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  submitText: { color: colors.white, fontSize: 17 },
});
