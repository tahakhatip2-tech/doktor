import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/theme/colors';
import { Card, ScreenHeader, Skeleton } from '../../src/components/common';
import { useAuthStore } from '../../src/store/auth.store';
import { doctorAppointmentsApi } from '../../src/api/appointments.api';
import { AppointmentStats } from '../../src/types/appointment.types';
import { getErrorMessage } from '../../src/api/client';

export default function DoctorDashboard() {
  const { doctorUser } = useAuthStore() as any;
  const router = useRouter();
  
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await doctorAppointmentsApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.log('Error fetching stats:', getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCards = [
    { title: 'إجمالي اليوم', value: stats?.today_total || 0, icon: 'people', color: colors.primary },
    { title: 'في الانتظار', value: stats?.today_waiting || 0, icon: 'time', color: colors.warning },
    { title: 'تم الكشف', value: stats?.today_completed || 0, icon: 'checkmark-circle', color: colors.success },
    { title: 'ملغية', value: stats?.today_cancelled || 0, icon: 'close-circle', color: colors.error },
  ];

  const quickActions = [
    {
      title: 'قائمة المواعيد',
      sub: 'إدارة المواعيد والمرضى',
      icon: 'calendar' as const,
      color: colors.primary,
      route: '/(doctor)/appointments'
    },
    {
      title: 'بحث عن مريض',
      sub: 'الوصول السريع لملف المريض',
      icon: 'search' as const,
      color: colors.info,
      route: '/(doctor)/patients'
    },
    {
      title: 'التحليل المالي',
      sub: 'الأرباح وإيرادات العيادة',
      icon: 'wallet' as const,
      color: colors.success,
      route: '/(doctor)/financial'
    },
  ];

  const doctorName = doctorUser?.name || 'الطبيب';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader 
        title="لوحة تحكم الطبيب" 
        showBack={false}
        rightComponent={
          <View style={styles.headerProfile}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="stethoscope" size={20} color={colors.primary} />
            </View>
          </View>
        }
      />
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <LinearGradient
            colors={['rgba(108,99,255,0.25)', 'rgba(108,99,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerGreeting}>مرحباً،</Text>
            <Text style={styles.bannerName}>{doctorName}</Text>
            <Text style={styles.bannerSub}>لديك {stats?.today_total || 0} موعد اليوم</Text>
          </View>
          <View style={styles.bannerIcon}>
            <MaterialCommunityIcons name="stethoscope" size={48} color={colors.primary} style={{ opacity: 0.3 }} />
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>العيادة مفتوحة</Text>
            <Text style={styles.statusSub}>تستقبل المواعيد كالمعتاد</Text>
          </View>
          <TouchableOpacity style={styles.statusToggle}>
            <Text style={styles.statusToggleText}>إغلاق</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>إحصائيات اليوم</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {isLoading && !refreshing ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.statCard}>
                <Skeleton width={40} height={40} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width="50%" height={28} style={{ marginBottom: 8 }} />
                <Skeleton width="70%" height={14} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statCards.map((card, idx) => (
              <View key={idx} style={[styles.statCard, { borderColor: `${card.color}30` }]}>
                <LinearGradient
                  colors={[`${card.color}12`, 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statHeader}>
                  <View style={[styles.iconBox, { backgroundColor: `${card.color}20` }]}>
                    <Ionicons name={card.icon as any} size={20} color={card.color} />
                  </View>
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statTitle}>{card.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 16 }]}>إجراءات سريعة</Text>
        
        <View style={styles.actionsContainer}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSub}>{action.sub}</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 50 },
  headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: `${colors.primary}50` },
  
  welcomeBanner: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  bannerContent: { flex: 1 },
  bannerGreeting: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  bannerName: { fontFamily: 'Cairo-Bold', fontSize: 22, color: colors.textMain, marginBottom: 4 },
  bannerSub: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.primaryLight },
  bannerIcon: { marginLeft: 16 },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
    gap: 12,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, shadowColor: colors.success, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  statusTitle: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.success },
  statusSub: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary },
  statusToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: `${colors.error}15`, borderWidth: 1, borderColor: `${colors.error}30` },
  statusToggleText: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.error },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.primary}10`, justifyContent: 'center', alignItems: 'center' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { 
    width: '47%', padding: 18, borderRadius: 20, 
    backgroundColor: colors.surface, borderWidth: 1, 
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  statHeader: { marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontFamily: 'Cairo-Bold', fontSize: 28, color: colors.textMain, marginBottom: 4 },
  statTitle: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  
  actionsContainer: { gap: 14 },
  actionCard: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: colors.surface, padding: 18, borderRadius: 20, 
    borderWidth: 1, borderColor: colors.borderLight, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionContent: { flex: 1 },
  actionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  actionSub: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
