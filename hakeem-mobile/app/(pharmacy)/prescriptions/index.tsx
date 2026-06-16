import { View, Text, FlatList, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, Input, Button, Badge } from '../../../src/components/common';

// نوع وهمي للوصفة الطبية
interface MockPrescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: 'pending' | 'dispensed';
  items: string[];
}

export default function PharmacyPrescriptionsScreen() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<MockPrescription[]>([]);

  // محاكاة البحث
  const handleSearch = () => {
    Keyboard.dismiss();
    if (!search.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال رقم الهوية أو كود الوصفة');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // بيانات وهمية للوصفات
      setPrescriptions([
        {
          id: 'RX-849201',
          patientName: 'أحمد محمود',
          doctorName: 'د. خالد سعيد (باطنية)',
          date: '2026-06-15',
          status: 'pending',
          items: ['Amoxil 500mg - 1x3', 'Panadol Advance - عند اللزوم'],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const handleDispense = (id: string) => {
    Alert.alert('تأكيد الصرف', 'هل أنت متأكد من صرف هذه الوصفة للمريض؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'تأكيد', 
        style: 'default',
        onPress: () => {
          setPrescriptions(prev => prev.map(p => 
            p.id === id ? { ...p, status: 'dispensed' } : p
          ));
          Alert.alert('نجاح', 'تم صرف الوصفة وتحديث النظام بنجاح.');
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: MockPrescription }) => (
    <Card style={{ marginBottom: 16, borderColor: item.status === 'dispensed' ? colors.border : colors.success }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, textAlign: 'left' }}>
            {item.patientName}
          </Text>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left', marginTop: 2 }}>
            من: {item.doctorName}
          </Text>
        </View>
        <Badge 
          label={item.status === 'pending' ? 'بانتظار الصرف' : 'تم الصرف'} 
          variant={item.status === 'pending' ? 'warning' : 'muted'} 
        />
      </View>

      <View style={{ backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textMain, marginBottom: 8, textAlign: 'left' }}>الأدوية الموصوفة:</Text>
        {item.items.map((med, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name="medical" size={14} color={colors.primary} />
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'left' }}>{med}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textMuted }}>كود: {item.id}</Text>
        {item.status === 'pending' ? (
          <Button 
            title="صرف الأدوية" 
            size="sm" 
            variant="primary"
            style={{ backgroundColor: colors.success }}
            onPress={() => handleDispense(item.id)}
            fullWidth={false}
          />
        ) : (
          <Ionicons name="checkmark-done-circle" size={32} color={colors.success} />
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 16, textAlign: 'left' }}>الوصفات الطبية</Text>
        
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Input 
              value={search}
              onChangeText={setSearch}
              placeholder="رقم الهوية أو كود الوصفة..."
              keyboardType="default"
            />
          </View>
          <TouchableOpacity 
            style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}
            onPress={handleSearch}
            disabled={isLoading}
          >
            <Ionicons name="search" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="barcode-outline" size={40} color={colors.textSecondary} />
            </View>
            <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>
              أدخل رقم هوية المريض أو كود الوصفة للبحث وعرض الأدوية
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
