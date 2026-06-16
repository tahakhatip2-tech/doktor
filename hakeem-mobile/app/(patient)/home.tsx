import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/auth.store';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/common';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PatientDashboard() {
  const { patientUser } = useAuthStore() as any;
  const router = useRouter();

  const services = [
    { id: 'clinics', title: 'العيادات', icon: 'medical-outline', color: colors.primary, route: '/(patient)/clinics' },
    { id: 'appointments', title: 'مواعيدي', icon: 'calendar-outline', color: colors.accent, route: '/(patient)/appointments' },
    { id: 'reports', title: 'تقاريري الطبية', icon: 'document-text-outline', color: colors.success, route: '/(patient)/settings' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 24 }}>🧑‍💼</Text>
            </View>
            <View>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>مرحباً بك،</Text>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain }}>{patientUser?.name || 'مريض'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            onPress={() => router.push('/(patient)/settings')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.textMain} />
          </TouchableOpacity>
        </View>

        {/* Quick Action / Notice */}
        <Card style={{ marginBottom: 24 }} accent>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: `${colors.accent}20`, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="add-circle-outline" size={32} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 4, textAlign: 'left' }}>احجز موعداً جديداً</Text>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>ابحث عن أفضل الأطباء واحجز موعدك بسهولة.</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={{ marginTop: 16, backgroundColor: colors.accent, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
            onPress={() => router.push('/(patient)/clinics')}
          >
            <Text style={{ fontFamily: 'Cairo-Bold', color: colors.white, fontSize: 15 }}>البحث عن عيادة</Text>
          </TouchableOpacity>
        </Card>

        {/* Services Grid */}
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>الخدمات السريعة</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 24 }}>
          {services.map((service) => (
            <TouchableOpacity 
              key={service.id} 
              style={{ width: '31%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
              onPress={() => router.push(service.route as any)}
            >
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${service.color}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name={service.icon as any} size={24} color={service.color} />
              </View>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.textMain, textAlign: 'center' }}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Appointments (Placeholder) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain }}>مواعيدك القادمة</Text>
          <TouchableOpacity onPress={() => router.push('/(patient)/appointments')}>
            <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.primary }}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        <Card style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="calendar-clear-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textMain, marginBottom: 4 }}>لا توجد مواعيد قادمة</Text>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>قم بحجز موعدك الأول لتظهر تفاصيله هنا.</Text>
        </Card>
        
      </ScrollView>
    </SafeAreaView>
  );
}
