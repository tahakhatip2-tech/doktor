import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { doctorAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { Button, AppointmentStatusBadge } from '../../../src/components/common';
import { getErrorMessage } from '../../../src/api/client';
import { formatDate, formatTime } from '../../../src/utils/format.utils';

export default function DoctorAppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setIsLoading(true);
      const res = await doctorAppointmentsApi.getById(Number(id));
      setAppointment(res.data);
    } catch (err) {
      Alert.alert('خطأ', getErrorMessage(err));
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      setIsUpdating(true);
      await doctorAppointmentsApi.update(Number(id), { status: newStatus });
      fetchAppointment();
      Alert.alert('نجاح', 'تم تحديث حالة الموعد بنجاح');
    } catch (err) {
      Alert.alert('خطأ في التحديث', getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!appointment) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, textAlign: 'center' }}>
          تفاصيل الموعد
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Patient Info */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.info}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
             <Text style={{ fontSize: 32 }}>🧑</Text>
          </View>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 20, color: colors.textMain, marginBottom: 4 }}>
            {appointment.customerName || 'مريض غير مسجل'}
          </Text>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.textSecondary }}>
            {appointment.phone}
          </Text>
        </View>

        {/* Appointment Details */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain }}>الحالة الحالية:</Text>
            <AppointmentStatusBadge status={appointment.status} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>تاريخ الموعد</Text>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textMain, textAlign: 'left' }}>{formatDate(appointment.appointmentDate)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${colors.accent}15`, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>الوقت المجدول</Text>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textMain, textAlign: 'left' }}>{formatTime(appointment.appointmentDate)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${colors.success}15`, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="medical-outline" size={20} color={colors.success} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>نوع الزيارة</Text>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textMain, textAlign: 'left' }}>
                {appointment.type === 'consultation' ? 'استشارة' : appointment.type === 'followup' ? 'مراجعة' : 'أخرى'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View style={{ backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.borderLight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMain} />
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain, textAlign: 'left' }}>ملاحظات المريض:</Text>
            </View>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'left', lineHeight: 24 }}>
              {appointment.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {appointment.status === 'pending' && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button 
                title="تأكيد الموعد" 
                onPress={() => handleUpdateStatus('confirmed')} 
                loading={isUpdating}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button 
                title="رفض وإلغاء" 
                variant="danger"
                onPress={() => handleUpdateStatus('cancelled')} 
                loading={isUpdating}
              />
            </View>
          </View>
        )}

        {appointment.status === 'confirmed' && (
          <View style={{ gap: 12 }}>
            <Button 
              title="تم الكشف بنجاح" 
              variant="primary"
              style={{ backgroundColor: colors.success }}
              icon={<Ionicons name="checkmark-done" size={20} color={colors.white} />}
              onPress={() => handleUpdateStatus('completed')} 
              loading={isUpdating}
            />
            <Button 
              title="إلغاء الموعد" 
              variant="outline"
              onPress={() => handleUpdateStatus('cancelled')} 
              loading={isUpdating}
            />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
