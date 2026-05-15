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

const registerSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function PatientRegisterScreen() {
  const router = useRouter();
  const loginAsPatient = useAuthStore((state) => state.loginAsPatient);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', phone: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await patientAuthApi.register(data);
      const { token, patient } = response.data;
      
      if (token && patient) {
        await loginAsPatient(token, patient);
      }
    } catch (error) {
      Alert.alert('خطأ في إنشاء الحساب', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-0 z-10 p-2">
            <Text className="text-secondary text-base font-bold" style={{ fontFamily: 'Cairo-Bold' }}>عودة ➔</Text>
          </TouchableOpacity>

          <View className="mb-8 items-center mt-6">
            <Text className="text-2xl font-bold text-textMain text-center mb-2" style={{ fontFamily: 'Cairo-Bold' }}>
              إنشاء حساب مريض
            </Text>
            <Text className="text-sm text-textSecondary text-center" style={{ fontFamily: 'Cairo-Regular' }}>
              انضم إلينا وابدأ بحجز مواعيدك بسهولة
            </Text>
          </View>

          <View className="gap-y-4">
             {/* حقل الاسم */}
             <View>
              <Text className="text-textMain mb-2" style={{ fontFamily: 'Cairo-SemiBold' }}>الاسم الكامل</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-4 text-textMain text-right"
                    style={{ fontFamily: 'Cairo-Regular' }}
                    placeholder="الاسم الرباعي"
                    placeholderTextColor="#64748B"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.fullName && <Text className="text-error text-sm mt-1" style={{ fontFamily: 'Cairo-Regular' }}>{errors.fullName.message}</Text>}
            </View>

            {/* حقل الهاتف */}
            <View>
              <Text className="text-textMain mb-2" style={{ fontFamily: 'Cairo-SemiBold' }}>رقم الهاتف</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-4 text-textMain text-right"
                    style={{ fontFamily: 'Cairo-Regular' }}
                    placeholder="07xxxxxxxx"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.phone && <Text className="text-error text-sm mt-1" style={{ fontFamily: 'Cairo-Regular' }}>{errors.phone.message}</Text>}
            </View>

            {/* حقل الإيميل */}
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

            {/* حقل الباسورد */}
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
                <Text className="text-background text-lg font-bold" style={{ fontFamily: 'Cairo-Bold' }}>إنشاء حساب</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
