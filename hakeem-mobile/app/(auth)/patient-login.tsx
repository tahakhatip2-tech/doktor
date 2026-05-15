import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { patientAuthApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/api/client';

const patientLoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح').min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type PatientLoginData = z.infer<typeof patientLoginSchema>;

export default function PatientLoginScreen() {
  const router = useRouter();
  const loginAsPatient = useAuthStore((state) => state.loginAsPatient);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<PatientLoginData>({
    resolver: zodResolver(patientLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: PatientLoginData) => {
    setIsLoading(true);
    try {
      const response = await patientAuthApi.login(data);
      const { token, patient } = response.data;
      
      if (token && patient) {
        await loginAsPatient(token, patient);
      }
    } catch (error) {
      Alert.alert('خطأ في تسجيل الدخول', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-6 z-10 p-2">
            <Text className="text-secondary text-base font-bold" style={{ fontFamily: 'Cairo-Bold' }}>عودة ➔</Text>
          </TouchableOpacity>

          <View className="mb-10 items-center mt-8">
            <View className="w-20 h-20 bg-secondary/20 rounded-2xl items-center justify-center mb-4">
               <Text className="text-3xl">👤</Text>
            </View>
            <Text className="text-3xl font-bold text-textMain text-center mb-2" style={{ fontFamily: 'Cairo-Bold' }}>
              دخول المراجعين
            </Text>
            <Text className="text-base text-textSecondary text-center" style={{ fontFamily: 'Cairo-Regular' }}>
              احجز موعدك وتابع سجلاتك الطبية
            </Text>
          </View>

          <View className="gap-y-4">
            <View>
              <Text className="text-textMain mb-2" style={{ fontFamily: 'Cairo-SemiBold' }}>البريد الإلكتروني</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-4 text-textMain text-right"
                    style={{ fontFamily: 'Cairo-Regular' }}
                    placeholder="mail@example.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text className="text-error text-sm mt-1" style={{ fontFamily: 'Cairo-Regular' }}>{errors.email.message}</Text>}
            </View>

            <View>
              <Text className="text-textMain mb-2" style={{ fontFamily: 'Cairo-SemiBold' }}>كلمة المرور</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-4 text-textMain text-right"
                    style={{ fontFamily: 'Cairo-Regular' }}
                    placeholder="••••••••"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text className="text-error text-sm mt-1" style={{ fontFamily: 'Cairo-Regular' }}>{errors.password.message}</Text>}
            </View>

            <TouchableOpacity 
              className={`bg-secondary w-full py-4 rounded-xl items-center mt-4 ${isLoading ? 'opacity-70' : ''}`}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                 <ActivityIndicator color="#0F172A" />
              ) : (
                <Text className="text-background text-lg font-bold" style={{ fontFamily: 'Cairo-Bold' }}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6 items-center">
              <TouchableOpacity onPress={() => router.push('/(auth)/patient-register')}>
                <Text className="text-secondary font-bold" style={{ fontFamily: 'Cairo-Bold' }}> سجل الآن</Text>
              </TouchableOpacity>
              <Text className="text-textSecondary" style={{ fontFamily: 'Cairo-Regular' }}>ليس لديك حساب؟</Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
