import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/common';
import { useAuthStore } from '../../src/store/auth.store';

export default function PharmacyDashboard() {
  const { pharmacyUser } = useAuthStore() as any;
  const router = useRouter();
  
  const statCards = [
    { title: 'تم صرفها اليوم', value: '12', icon: 'checkmark-circle', color: colors.success },
    { title: 'بانتظار الصرف', value: '5', icon: 'time', color: colors.warning },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.success}20`, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.success }}>
              <Text style={{ fontSize: 24 }}>💊</Text>
            </View>
            <View>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>مرحباً بك،</Text>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain }}>{pharmacyUser?.name || 'صيدلية حكيم'}</Text>
            </View>
          </View>
        </View>

        {/* Quick Action / Notice */}
        <Card style={{ marginBottom: 24, borderColor: colors.success }} accent>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: `${colors.success}20`, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="scan-outline" size={32} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 4, textAlign: 'left' }}>صرف وصفة طبية</Text>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>ابحث برقم هوية المريض أو كود الوصفة لصرفها فوراً.</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={{ marginTop: 16, backgroundColor: colors.success, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
            onPress={() => router.push('/(pharmacy)/prescriptions')}
          >
            <Text style={{ fontFamily: 'Cairo-Bold', color: colors.white, fontSize: 15 }}>البحث عن وصفة</Text>
          </TouchableOpacity>
        </Card>

        {/* Stats Grid */}
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>نشاط اليوم</Text>
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

        {/* Recent Updates */}
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>تحديثات النظام</Text>
        <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain, marginBottom: 4, textAlign: 'left' }}>ربط التأمين الطبي</Text>
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left', lineHeight: 20 }}>
                تم تفعيل ميزة قراءة الموافقات الطبية لشركات التأمين مباشرة عبر نظام حكيم جو.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
