import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { AppHeader, Card, Skeleton, PageHero } from '../../../src/components/common';
import { financialApi, FinancialTransaction, FinancialSummary } from '../../../src/api/appointments.api';
import { getErrorMessage } from '../../../src/api/client';

const SCREEN_WIDTH = Dimensions.get('window').width;

// رسم بياني بسيط بدون مكتبات خارجية
function SimpleBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const chartWidth = SCREEN_WIDTH - 80;
  const barWidth = Math.floor((chartWidth / data.length) - 8);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((item, i) => {
          const height = Math.max((item.value / max) * 100, 4);
          const isMax = item.value === max;
          return (
            <View key={i} style={chartStyles.barWrapper}>
              {isMax && (
                <Text style={chartStyles.valueLabel}>{item.value}</Text>
              )}
              <View
                style={[
                  chartStyles.bar,
                  { height, width: barWidth, backgroundColor: isMax ? colors.primary : `${colors.primary}50` },
                ]}
              />
              <Text style={chartStyles.barLabel} numberOfLines={1}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { paddingVertical: 8 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 4 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { borderRadius: 6 },
  barLabel: { fontFamily: 'Cairo-Regular', fontSize: 9, color: colors.textSecondary, textAlign: 'center' },
  valueLabel: { fontFamily: 'Cairo-Bold', fontSize: 10, color: colors.primary },
});

export default function DoctorFinancialScreen() {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // بيانات الرسم البياني من المعاملات
  const chartData = (() => {
    if (transactions.length === 0) return [];
    if (filter === 'week') {
      const days = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
      const grouped: Record<string, number> = {};
      transactions.forEach(tx => {
        const day = days[new Date(tx.date).getDay()];
        grouped[day] = (grouped[day] || 0) + tx.amount;
      });
      return days.map(d => ({ label: d, value: grouped[d] || 0 }));
    }
    if (filter === 'month') {
      const weeks = ['أ1', 'أ2', 'أ3', 'أ4'];
      const grouped: Record<string, number> = {};
      transactions.forEach(tx => {
        const week = `أ${Math.ceil(new Date(tx.date).getDate() / 7)}`;
        grouped[week] = (grouped[week] || 0) + tx.amount;
      });
      return weeks.map(w => ({ label: w, value: grouped[w] || 0 }));
    }
    // day — كل ساعتين
    const hours = ['8ص', '10ص', '12م', '2م', '4م', '6م'];
    return hours.map(h => ({ label: h, value: 0 }));
  })();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summaryRes, txRes] = await Promise.all([
        financialApi.getSummary(filter),
        financialApi.getTransactions(filter),
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.log(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const renderTransaction = (item: FinancialTransaction, idx: number, arr: FinancialTransaction[]) => (
    <View key={item.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons name={item.amount > 0 ? "arrow-down" : "checkmark"} size={20} color={item.amount > 0 ? colors.success : colors.textSecondary} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName}>{item.patientName}</Text>
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
      <PageHero
        title="التحليل المالي"
        subtitle="إيرادات العيادة والتقارير المالية"
        icon="wallet-outline"
        iconColor="#10b981"
        showClock={false}
      />

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {/* Main Stats */}
        {isLoading ? (
          <View style={[styles.revenueCard, { alignItems: 'center' }]}>
            <Skeleton width={120} height={20} style={{ marginBottom: 12 }} />
            <Skeleton width={160} height={40} style={{ marginBottom: 12 }} />
            <Skeleton width={180} height={16} />
          </View>
        ) : (
        <Card style={styles.revenueCard} accent>
          <Text style={styles.revenueTitle}>إجمالي الإيرادات</Text>
          <Text style={styles.revenueAmount}>{summary?.totalRevenue ?? 0} د.أ</Text>
          <View style={styles.revenueGrowth}>
            <Ionicons name="trending-up" size={16} color={colors.success} />
            <Text style={styles.growthText}>{summary?.growthPercent != null ? `+${summary.growthPercent}%` : '--'} مقارنة بالفترة السابقة</Text>
          </View>
        </Card>
        )}

        {/* Mini Stats */}
        <View style={styles.miniStatsContainer}>
          <Card style={styles.miniStatCard}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
               <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <Text style={styles.miniStatValue}>{summary?.appointmentsCount ?? 0}</Text>
            <Text style={styles.miniStatLabel}>المرضى (مدفوع)</Text>
          </Card>
          <Card style={styles.miniStatCard}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.warning}15` }]}>
               <Ionicons name="time" size={20} color={colors.warning} />
            </View>
            <Text style={styles.miniStatValue}>{summary?.pendingPayments ?? 0}</Text>
            <Text style={styles.miniStatLabel}>دفعات معلقة</Text>
          </Card>
        </View>

        {/* Bar Chart */}
        {!isLoading && chartData.length > 0 && (
          <Card style={[styles.transactionsCard, { marginBottom: 16 }]}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>توزيع الإيرادات</Text>
            <SimpleBarChart data={chartData} />
          </Card>
        )}

        {/* Transactions List */}
        <Text style={styles.sectionTitle}>آخر المعاملات</Text>
        <Card style={styles.transactionsCard}>
          {isLoading ? (
            [1,2,3].map(i => <Skeleton key={i} width="100%" height={56} style={{ marginBottom: 8, borderRadius: 8 }} />)
          ) : transactions.length === 0 ? (
            <Text style={{ fontFamily: 'Cairo-Regular', color: colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>
              لا توجد معاملات في هذه الفترة
            </Text>
          ) : (
            transactions.map((item, index) => (
              <View key={item.id}>
                {renderTransaction(item, index, transactions)}
                {index < transactions.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
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
