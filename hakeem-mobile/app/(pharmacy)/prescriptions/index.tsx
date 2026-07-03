import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, Input, Badge, ScreenHeader, EmptyState, Skeleton, useToast, Toast } from '../../../src/components/common';

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
  const router = useRouter();
  const { toast, show, hide } = useToast();
  
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<MockPrescription[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // محاكاة البحث
  const handleSearch = () => {
    Keyboard.dismiss();
    if (!search.trim()) {
      show('الرجاء إدخال رقم الهوية أو كود الوصفة', 'error');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
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
    }, 1200);
  };

  const renderItem = ({ item }: { item: MockPrescription }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push(`/(pharmacy)/prescriptions/${item.id}` as any)}
    >
      <Card style={item.status === 'dispensed' ? { borderColor: colors.border, padding: 16, marginBottom: 16 } : { borderColor: colors.success, padding: 16, marginBottom: 16 }}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <Text style={styles.doctorName}>من: {item.doctorName}</Text>
          </View>
          <Badge 
            label={item.status === 'pending' ? 'بانتظار الصرف' : 'تم الصرف'} 
            variant={item.status === 'pending' ? 'warning' : 'muted'} 
          />
        </View>

        <View style={styles.itemsBox}>
          <Text style={styles.itemsTitle}>الأدوية الموصوفة ({item.items.length}):</Text>
          <View style={styles.itemsList}>
            {item.items.slice(0, 2).map((med, idx) => (
              <View key={idx} style={styles.medRow}>
                <Ionicons name="medical" size={14} color={colors.primary} />
                <Text style={styles.medText} numberOfLines={1}>{med}</Text>
              </View>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreText}>+ {item.items.length - 2} أدوية أخرى</Text>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.codeText}>كود: {item.id}</Text>
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>التفاصيل والصرف</Text>
            <Ionicons name="chevron-back" size={16} color={colors.success} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="البحث عن وصفة طبية" showBack={false} />
      
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input 
              value={search}
              onChangeText={setSearch}
              placeholder="رقم الهوية أو كود الوصفة..."
              keyboardType="default"
              style={{ marginBottom: 0 }}
            />
          </View>
          <TouchableOpacity 
            style={[styles.searchBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            <Ionicons name="search" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.list}>
           <Card style={styles.card}>
             <View style={styles.cardHeader}>
               <View style={{ flex: 1, gap: 8 }}>
                 <Skeleton width="60%" height={20} />
                 <Skeleton width="40%" height={14} />
               </View>
               <Skeleton width={80} height={24} borderRadius={12} />
             </View>
             <Skeleton width="100%" height={80} borderRadius={8} style={{ marginBottom: 16 }} />
             <Skeleton width="100%" height={30} />
           </Card>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={hasSearched ? "search-outline" : "barcode-outline"}
              title={hasSearched ? "لم يتم العثور على الوصفة" : "ابحث عن وصفة مريض"}
              subtitle={hasSearched ? "تأكد من رقم الهوية أو الكود المدخل وحاول مجدداً." : "أدخل رقم هوية المريض أو كود الوصفة للبحث وعرض الأدوية."}
            />
          }
        />
      )}
      
      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchSection: { padding: 20, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  searchBtn: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 40 },
  card: { padding: 16, marginBottom: 16, borderColor: colors.success },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  patientName: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, textAlign: 'left' },
  doctorName: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left', marginTop: 4 },
  itemsBox: { backgroundColor: colors.surfaceLight, padding: 12, borderRadius: 8, marginBottom: 16 },
  itemsTitle: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textMain, marginBottom: 8, textAlign: 'left' },
  itemsList: { gap: 6 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  medText: { flex: 1, fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'left' },
  moreText: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.primary, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  codeText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textMuted },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsBtnText: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.success },
});
