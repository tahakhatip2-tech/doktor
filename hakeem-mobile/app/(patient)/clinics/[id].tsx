import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { clinicsApi } from '../../../src/api/modules.api';
import { patientAppointmentsApi } from '../../../src/api/appointments.api';
import { Clinic } from '../../../src/types/clinic.types';
import { Button, Input } from '../../../src/components/common';
import { getErrorMessage } from '../../../src/api/client';

export default function ClinicDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  // نموذج الحجز
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchClinic();
  }, [id]);

  const fetchClinic = async () => {
    try {
      setIsLoading(true);
      const res = await clinicsApi.getById(Number(id));
      setClinic(res.data);
    } catch (err) {
      Alert.alert('خطأ', getErrorMessage(err));
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!date || !time) {
      Alert.alert('تنبيه', 'الرجاء اختيار تاريخ ووقت الموعد');
      return;
    }

    try {
      setIsBooking(true);
      // دمج التاريخ والوقت لتكوين ISO string
      const appointmentDate = new Date(`${date}T${time}:00`).toISOString();
      
      await patientAppointmentsApi.create({
        clinicId: Number(id),
        appointmentDate,
        notes,
        type: 'consultation',
      });
      
      Alert.alert('نجاح', 'تم حجز موعدك بنجاح وسوف تصلك رسالة تأكيد.', [
        { text: 'حسناً', onPress: () => router.push('/(patient)/appointments') }
      ]);
    } catch (err) {
      Alert.alert('خطأ في الحجز', getErrorMessage(err));
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!clinic) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Map/Image Placeholder */}
        <View style={{ height: 200, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Ionicons name="map-outline" size={64} color={colors.border} />
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Clinic Info */}
        <View style={{ padding: 20, marginTop: -30, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, textAlign: 'left' }}>{clinic.name}</Text>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.primary, textAlign: 'left' }}>
                {clinic.metadata?.specialty || 'تخصص عام'}
              </Text>
            </View>
            <View style={{ backgroundColor: `${colors.success}20`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              <Text style={{ fontFamily: 'Cairo-SemiBold', color: colors.success }}>متاح الآن</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <Ionicons name="location" size={18} color={colors.textSecondary} />
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary }}>
              {clinic.address || 'العنوان غير محدد بالتفصيل'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 8 }}>
            <Ionicons name="call" size={18} color={colors.textSecondary} />
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary }}>
              {clinic.phone || 'رقم الهاتف غير متاح'}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 24 }} />

          {/* Booking Form */}
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>حجز موعد</Text>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Input 
                label="التاريخ (مؤقتاً)" 
                placeholder="YYYY-MM-DD" 
                value={date} 
                onChangeText={setDate}
                icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input 
                label="الوقت" 
                placeholder="HH:MM" 
                value={time} 
                onChangeText={setTime}
                icon={<Ionicons name="time-outline" size={20} color={colors.textSecondary} />}
              />
            </View>
          </View>

          <Input 
            label="ملاحظات للطبيب (اختياري)" 
            placeholder="مثال: أعاني من ألم في الرأس منذ يومين..." 
            value={notes} 
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ marginBottom: 24 }}
          />

          <Button 
            title="تأكيد الحجز" 
            onPress={handleBook} 
            loading={isBooking}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
