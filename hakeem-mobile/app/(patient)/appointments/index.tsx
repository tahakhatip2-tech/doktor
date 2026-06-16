import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, AppointmentStatusBadge, Button } from '../../../src/components/common';
import { patientAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { getErrorMessage } from '../../../src/api/client';
import { formatDate, formatTime } from '../../../src/utils/format.utils';
import { useFocusEffect } from 'expo-router';

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = filter === 'upcoming' 
        ? await patientAppointmentsApi.getUpcoming()
        : await patientAppointmentsApi.getAll();
      
      setAppointments(res.data);
    } catch (err) {
      Alert.alert('خطأ', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [filter])
  );

  const handleCancel = (id: number) => {
    Alert.alert('إلغاء الموعد', 'هل أنت متأكد أنك تريد إلغاء هذا الموعد؟', [
      { text: 'تراجع', style: 'cancel' },
      { 
        text: 'تأكيد الإلغاء', 
        style: 'destructive',
        onPress: async () => {
          try {
            await patientAppointmentsApi.cancel(id, { reason: 'إلغاء من قبل المريض' });
            fetchAppointments();
          } catch (err) {
            Alert.alert('خطأ', getErrorMessage(err));
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Appointment }) => (
    <Card style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain }}>
          {item.clinic?.clinic_name || 'عيادة طبية'}
        </Text>
        <AppointmentStatusBadge status={item.status} />
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>
            {formatDate(item.appointmentDate)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>
            {formatTime(item.appointmentDate)}
          </Text>
        </View>
      </View>

      {item.notes && (
        <View style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary }}>ملاحظتك: {item.notes}</Text>
        </View>
      )}

      {item.status === 'pending' || item.status === 'confirmed' ? (
        <Button 
          title="إلغاء الموعد" 
          variant="outline" 
          size="sm" 
          onPress={() => handleCancel(item.id)}
        />
      ) : null}
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>سجل المواعيد</Text>
        
        {/* فلاتر */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['upcoming', 'past', 'all'] as const).map(f => (
            <TouchableOpacity 
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16, 
                paddingVertical: 8, 
                borderRadius: 20,
                backgroundColor: filter === f ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: filter === f ? colors.primary : colors.border
              }}
            >
              <Text style={{ 
                fontFamily: 'Cairo-SemiBold', 
                color: filter === f ? colors.white : colors.textSecondary,
                fontSize: 13 
              }}>
                {f === 'upcoming' ? 'القادمة' : f === 'past' ? 'السابقة' : 'الكل'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="calendar-clear-outline" size={64} color={colors.surfaceLight} />
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 16, color: colors.textSecondary, marginTop: 16 }}>لا توجد مواعيد حالياً</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
