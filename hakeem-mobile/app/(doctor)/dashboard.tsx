import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/common';
import { useAuthStore } from '../../src/store/auth.store';
import { doctorAppointmentsApi } from '../../src/api/appointments.api';
import { AppointmentStats } from '../../src/types/appointment.types';
import { getErrorMessage } from '../../src/api/client';

export default function DoctorDashboard() {
  const { doctorUser } = useAuthStore() as any;
  const router = useRouter();
  
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await doctorAppointmentsApi.getStats();
      setStats(res.data);
    } catch (err) {
      Alert.alert('خطأ', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'إجمالي اليوم', value: stats?.today_total || 0, icon: 'people', color: colors.primary },
    { title: 'في الانتظار', value: stats?.today_waiting || 0, icon: 'time', color: colors.warning },
    { title: 'تم الكشف', value: stats?.today_completed || 0, icon: 'checkmark-circle', color: colors.success },
    { title: 'ملغية', value: stats?.today_cancelled || 0, icon: 'close-circle', color: colors.error },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
            </View>
            <View>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>العيادة</Text>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain }}>{doctorUser?.name || 'د. حكيم'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => fetchStats()} style={{ padding: 8 }}>
            <Ionicons name="refresh-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Alert */}
        <Card style={{ marginBottom: 24, backgroundColor: `${colors.success}15`, borderColor: colors.success }} accent>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="radio-button-on" size={24} color={colors.success} />
            <View>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.success, textAlign: 'left' }}>العيادة مفتوحة</Text>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>تستقبل المواعيد كالمعتاد</Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>إحصائيات اليوم</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 24 }}>
            {statCards.map((card, idx) => (
              <Card key={idx} style={{ width: '48%', padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${card.color}15`, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name={card.icon as any} size={20} color={card.color} />
                  </View>
                  <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain }}>{card.value}</Text>
                </View>
                <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textSecondary, textAlign: 'left' }}>{card.title}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>إجراءات سريعة</Text>
        
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
          onPress={() => router.push('/(doctor)/appointments')}
        >
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center', marginLeft: 16 }}>
            <Ionicons name="list" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'left' }}>قائمة المواعيد</Text>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>إدارة المواعيد، القبول، والإلغاء</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
          onPress={() => router.push('/(doctor)/patients')}
        >
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${colors.info}15`, justifyContent: 'center', alignItems: 'center', marginLeft: 16 }}>
            <Ionicons name="search" size={24} color={colors.info} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'left' }}>بحث عن مريض</Text>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>الوصول السريع لملف وسجل المريض</Text>
          </View>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
