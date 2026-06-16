import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, AppointmentStatusBadge } from '../../../src/components/common';
import { doctorAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { getErrorMessage } from '../../../src/api/client';
import { formatTime } from '../../../src/utils/format.utils';

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await doctorAppointmentsApi.getAll(params);
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
    }, [activeTab])
  );

  const renderItem = ({ item }: { item: Appointment }) => (
    <TouchableOpacity onPress={() => router.push(`/(doctor)/appointments/${item.id}`)} activeOpacity={0.8}>
      <Card style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'left' }}>
              {item.customerName || 'مريض غير مسجل'}
            </Text>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>
              {item.phone}
            </Text>
          </View>
          <AppointmentStatusBadge status={item.status} />
        </View>

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.primary }}>
              {formatTime(item.appointmentDate)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="medical-outline" size={18} color={colors.textSecondary} />
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>
              {item.type === 'consultation' ? 'استشارة' : item.type === 'followup' ? 'مراجعة' : 'أخرى'}
            </Text>
          </View>
        </View>

        {item.notes && (
          <View style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
              ملاحظة: {item.notes}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>إدارة المواعيد</Text>
        
        {/* فلاتر */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['pending', 'confirmed', 'all'] as const).map(tab => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10, 
                borderRadius: 12,
                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: activeTab === tab ? colors.primary : colors.border,
                alignItems: 'center'
              }}
            >
              <Text style={{ 
                fontFamily: 'Cairo-SemiBold', 
                color: activeTab === tab ? colors.white : colors.textSecondary,
                fontSize: 13 
              }}>
                {tab === 'pending' ? 'طلبات جديدة' : tab === 'confirmed' ? 'مؤكدة' : 'الكل'}
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
