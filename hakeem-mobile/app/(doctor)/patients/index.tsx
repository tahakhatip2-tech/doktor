import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, Input } from '../../../src/components/common';
import { contactsApi } from '../../../src/api/modules.api';
import { getErrorMessage } from '../../../src/api/client';

export default function DoctorPatientsScreen() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const res = await contactsApi.getAll({ search });
      setPatients(res.data?.data || []);
    } catch (err) {
      Alert.alert('خطأ', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [search]) // إعادة البحث عند تغير النص
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.8}>
      <Card style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: `${colors.info}20`, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ fontSize: 24 }}>🧑</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'left' }}>
              {item.name || 'مريض غير مسجل'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' }}>
                {item.phone}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => Alert.alert('قيد التطوير', 'سيتم فتح السجل الطبي للمريض.')}
          >
            <Ionicons name="folder-open-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>مرضى العيادة</Text>
        
        <Input 
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          style={{ marginBottom: 16 }}
        />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="people-outline" size={64} color={colors.surfaceLight} />
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 16, color: colors.textSecondary, marginTop: 16 }}>لا يوجد مرضى مطابقين للبحث</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
