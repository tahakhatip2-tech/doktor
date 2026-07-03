import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { AppHeader, EmptyState, Card, useToast, Toast } from '../../../src/components/common';
import { medicalRecordsApi } from '../../../src/api/modules.api';
import { MedicalRecord } from '../../../src/types/clinic.types';
import { getErrorMessage } from '../../../src/api/client';

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [filter, setFilter] = useState('all');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await medicalRecordsApi.getAll();
      setRecords(res.data || []);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'prescription': return { name: 'flask', color: colors.success, bg: `${colors.success}15` };
      case 'report': return { name: 'document-text', color: colors.info, bg: `${colors.info}15` };
      case 'xray': return { name: 'body', color: colors.primary, bg: `${colors.primary}15` };
      default: return { name: 'document-text', color: colors.primaryLight, bg: `${colors.primaryLight}15` };
    }
  };

  const getFilteredRecords = () => {
    if (filter === 'all') return records;
    if (filter === 'وصفات طبية') return records.filter(r => r.recordType === 'prescription');
    if (filter === 'تقارير') return records.filter(r => r.recordType === 'report');
    if (filter === 'أشعة وتحاليل') return records.filter(r => r.recordType === 'xray');
    return records;
  };

  const renderItem = ({ item }: { item: MedicalRecord }) => {
    const iconConfig = getIcon(item.recordType);
    const date = new Date(item.createdAt).toLocaleDateString('ar-SA');
    const clinicName = item.appointment?.clinic?.clinic_name || 'طبيب/عيادة';
    const clinicSpecialty = item.appointment?.clinic?.clinic_specialty || 'سجل طبي';
    const recordContent = item.diagnosis || item.treatment || 'لا توجد تفاصيل';
    
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
              <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
            </View>
            <View>
              <Text style={styles.doctorName}>{clinicName}</Text>
              <Text style={styles.specialty}>{clinicSpecialty}</Text>
            </View>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>

        <Text style={styles.diagnosisLabel}>التفاصيل:</Text>
        <Text style={styles.diagnosisText} numberOfLines={3}>{recordContent}</Text>

        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => router.push(`/(patient)/medical-records/${item.id}` as any)}
        >
          <Text style={styles.detailsBtnText}>عرض التفاصيل الكاملة</Text>
          <Ionicons name="chevron-back" size={16} color={colors.primary} />
        </TouchableOpacity>
      </Card>
    );
  };

  const filteredData = getFilteredRecords();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="السجلات الطبية" showBack />
      
      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {['الكل', 'وصفات طبية', 'تقارير', 'أشعة وتحاليل'].map((f, i) => {
            const isSelected = filter === (i === 0 ? 'all' : f);
            return (
              <TouchableOpacity 
                key={f}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setFilter(i === 0 ? 'all' : f)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="document-text-outline" size={48} color={colors.primary} style={{ opacity: 0.5 }} />
          <Text style={{ fontFamily: 'Cairo-Regular', color: colors.textSecondary, marginTop: 16 }}>جاري تحميل السجلات...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title="لا توجد سجلات طبية"
              subtitle={filter === 'all' ? "لم يتم إضافة أي سجلات طبية أو وصفات لحسابك حتى الآن." : "لا توجد سجلات مطابقة للفلتر المحدد."}
            />
          }
        />
      )}
      
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtersRow: { 
    backgroundColor: colors.surface, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.borderLight 
  },
  filtersScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderWidth: 1, 
    borderColor: colors.borderLight 
  },
  filterChipActive: { 
    backgroundColor: colors.primary, 
    borderColor: colors.primary 
  },
  filterText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  listContainer: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { padding: 18, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  doctorName: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  specialty: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.primaryLight },
  dateBox: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dateText: { fontFamily: 'Cairo-SemiBold', fontSize: 11, color: colors.textSecondary },
  diagnosisLabel: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain, marginTop: 4 },
  diagnosisText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, lineHeight: 24 },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  detailsBtnText: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.primaryLight },
});
