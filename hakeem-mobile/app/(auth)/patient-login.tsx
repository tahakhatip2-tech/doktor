import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { patientAuthApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/api/client';
import { colors } from '../../src/theme/colors';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح').min(1, 'مطلوب'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});
type FormData = z.infer<typeof schema>;

export default function PatientLoginScreen() {
  const router = useRouter();
  const loginAsPatient = useAuthStore((s) => s.loginAsPatient);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await patientAuthApi.login(data);
      const token = res.data?.token;
      const user = res.data?.patient;
      if (token && user) {
        await loginAsPatient(token, user);
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
    <ImageBackground source={require('../../assets/bg.jpg')} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>

            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.glassCard}>
              <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="account-group" size={40} color={colors.accent} />
                </View>
                <Text style={[styles.title, { fontFamily: 'Cairo-Bold' }]}>بوابة المرضى</Text>
                <Text style={[styles.subtitle, { fontFamily: 'Cairo-Regular' }]}>تسجيل الدخول للاستفادة من خدماتنا</Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.fieldWrapper}>
                  <Text style={[styles.label, { fontFamily: 'Cairo-SemiBold' }]}>البريد الإلكتروني للمريض</Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, { fontFamily: 'Cairo-Regular' }]}
                        placeholder="patient@example.com"
                        placeholderTextColor="rgba(255,255,255,0.4)"
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
                        placeholderTextColor="rgba(255,255,255,0.4)"
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
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[styles.submitText, { fontFamily: 'Cairo-Bold' }]}>تسجيل الدخول</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                  <TouchableOpacity onPress={() => router.push('/(auth)/patient-register')}>
                    <Text style={[styles.registerLink, { fontFamily: 'Cairo-Bold' }]}>إنشاء حساب جديد</Text>
                  </TouchableOpacity>
                  <Text style={[styles.registerText, { fontFamily: 'Cairo-Regular' }]}>ليس لديك حساب؟</Text>
                </View>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 20, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderWidth: 1, borderColor: "rgba(249, 115, 22, 0.5)",
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, color: "#fff", textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: 'center' },
  formContainer: { gap: 16 },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: 'right' },
  input: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    color: "#fff", textAlign: 'right', fontSize: 15,
  },
  errorText: { fontSize: 13, color: colors.error, textAlign: 'right' },
  submitButton: {
    backgroundColor: colors.accent, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 12,
  },
  buttonDisabled: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 6 },
  registerLink: { color: colors.accent, fontSize: 14 },
  registerText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
});
