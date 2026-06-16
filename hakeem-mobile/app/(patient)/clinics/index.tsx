import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Input, Card, Badge } from '../../../src/components/common';
import { clinicsApi } from '../../../src/api/modules.api';
import { Clinic } from '../../../src/types/clinic.types';
import { getErrorMessage } from '../../../src/api/client';

export default function ClinicsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClinics();
  }, [search]); // إعادة البحث عند تغير النص

  const fetchClinics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // استخدام setTimeout لتقليل عدد الطلبات أثناء الكتابة (Debounce) محاكى هنا ببساطة
      const res = await clinicsApi.getAll({ search });
      setClinics(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const renderClinic = ({ item }: { item: Clinic }) => (
    <TouchableOpacity onPress={() => router.push(`/(patient)/clinics/${item.id}`)} activeOpacity={0.8}>
      <Card style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ fontSize: 32 }}>{item.metadata?.icon || '🏥'}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'left', flex: 1 }}>{item.name}</Text>
               <Badge label={item.status === 'active' ? 'متاح' : 'مغلق'} variant={item.status === 'active' ? 'success' : 'error'} size="sm" />
            </View>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.primary, marginTop: 4, textAlign: 'left' }}>
              {item.metadata?.specialty || 'تخصص عام'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary }}>
                {item.address || 'العنوان غير محدد'}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>العيادات الطبية</Text>
        
        <Input 
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن عيادة أو تخصص..."
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          style={{ marginBottom: 16 }}
        />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontFamily: 'Cairo-Regular', color: colors.error, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={fetchClinics} style={{ marginTop: 12, padding: 8 }}>
            <Text style={{ fontFamily: 'Cairo-SemiBold', color: colors.primary }}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClinic}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="medical-outline" size={64} color={colors.surfaceLight} />
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 16, color: colors.textSecondary, marginTop: 16 }}>لا توجد عيادات مطابقة للبحث</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
