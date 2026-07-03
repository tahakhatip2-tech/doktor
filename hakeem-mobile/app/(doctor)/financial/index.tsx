import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { AppHeader, Card } from '../../../src/components/common';

const MOCK_TRANSACTIONS = [
  { id: 1, patient: 'أحمد محمود', type: 'كشف عيادة', amount: 50, date: '2023-10-15', status: 'completed' },
  { id: 2, patient: 'سارة محمد', type: 'استشارة فيديو', amount: 30, date: '2023-10-14', status: 'completed' },
  { id: 3, patient: 'عمر خليل', type: 'كشف عيادة', amount: 50, date: '2023-10-14', status: 'completed' },
  { id: 4, patient: 'خالد عبدلله', type: 'مراجعة', amount: 0, date: '2023-10-13', status: 'completed' },
];

export default function DoctorFinancialScreen() {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');

  const stats = {
    totalRevenue: 130,
    appointmentsCount: 4,
    pendingPayments: 0,
  };

  const renderTransaction = (item: typeof MOCK_TRANSACTIONS[0]) => (
    <View key={item.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons name={item.amount > 0 ? "arrow-down" : "checkmark"} size={20} color={item.amount > 0 ? colors.success : colors.textSecondary} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName}>{item.patient}</Text>
        <Text style={styles.transactionType}>{item.type} • {item.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.amount > 0 ? colors.success : colors.textSecondary }]}>
        {item.amount > 0 ? `+${item.amount} د.أ` : 'مجاني'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="التحليل المالي" showBack={false} />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'day' && styles.filterBtnActive]}
          onPress={() => setFilter('day')}
        >
          <Text style={[styles.filterText, filter === 'day' && styles.filterTextActive]}>اليوم</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'week' && styles.filterBtnActive]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>هذا الأسبوع</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'month' && styles.filterBtnActive]}
          onPress={() => setFilter('month')}
        >
          <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>هذا الشهر</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Main Stats */}
        <Card style={styles.revenueCard} accent>
          <Text style={styles.revenueTitle}>إجمالي الإيرادات</Text>
          <Text style={styles.revenueAmount}>{stats.totalRevenue} د.أ</Text>
          <View style={styles.revenueGrowth}>
            <Ionicons name="trending-up" size={16} color={colors.success} />
            <Text style={styles.growthText}>+12% مقارنة بالفترة السابقة</Text>
          </View>
        </Card>

        {/* Mini Stats */}
        <View style={styles.miniStatsContainer}>
          <Card style={styles.miniStatCard}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
               <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <Text style={styles.miniStatValue}>{stats.appointmentsCount}</Text>
            <Text style={styles.miniStatLabel}>المرضى (مدفوع)</Text>
          </Card>
          <Card style={styles.miniStatCard}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.warning}15` }]}>
               <Ionicons name="time" size={20} color={colors.warning} />
            </View>
            <Text style={styles.miniStatValue}>{stats.pendingPayments}</Text>
            <Text style={styles.miniStatLabel}>دفعات معلقة</Text>
          </Card>
        </View>

        {/* Transactions List */}
        <Text style={styles.sectionTitle}>آخر المعاملات</Text>
        <Card style={styles.transactionsCard}>
          {MOCK_TRANSACTIONS.map((item, index) => (
            <View key={item.id}>
              {renderTransaction(item)}
              {index < MOCK_TRANSACTIONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filtersContainer: { flexDirection: 'row', backgroundColor: colors.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  scroll: { padding: 20, paddingBottom: 40 },
  revenueCard: { padding: 24, alignItems: 'center', backgroundColor: `${colors.primary}05`, borderColor: colors.primary, marginBottom: 16 },
  revenueTitle: { fontFamily: 'Cairo-SemiBold', fontSize: 16, color: colors.textSecondary, marginBottom: 8 },
  revenueAmount: { fontFamily: 'Cairo-Bold', fontSize: 36, color: colors.primary, marginBottom: 12 },
  revenueGrowth: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: `${colors.success}15`, borderRadius: 12 },
  growthText: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.success },
  miniStatsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  miniStatCard: { flex: 1, padding: 16, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniStatValue: { fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 4 },
  miniStatLabel: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' },
  transactionsCard: { padding: 16 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.success}15`, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  transactionInfo: { flex: 1 },
  transactionName: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain, textAlign: 'left' },
  transactionType: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left', marginTop: 2 },
  transactionAmount: { fontFamily: 'Cairo-Bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 8 },
});
