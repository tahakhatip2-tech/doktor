import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../src/theme/colors';
import { Card, AppHeader, Skeleton } from '../../src/components/common';
import { useAuthStore } from '../../src/store/auth.store';

export default function PharmacyDashboard() {
  const { pharmacyUser } = useAuthStore() as any;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const statCards = [
    { title: 'صُرفت اليوم', value: '12', icon: 'checkmark-circle', color: colors.success },
    { title: 'بانتظار الصرف', value: '5', icon: 'time', color: colors.warning },
    { title: 'الإيرادات', value: '450 د.أ', icon: 'cash', color: colors.primary },
    { title: 'نواقص المخزون', value: '3', icon: 'alert-circle', color: colors.error },
  ];

  const pharmacyName = pharmacyUser?.name || 'الصيدلية';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title="لوحة تحكم الصيدلية" 
        showBack={false}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pharmacyColor} />}
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <LinearGradient
            colors={['rgba(16,185,129,0.25)', 'rgba(16,185,129,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerGreeting}>مرحباً،</Text>
            <Text style={styles.bannerName}>{pharmacyName}</Text>
            <Text style={styles.bannerSub}>5 وصفات بانتظار الصرف اليوم</Text>
          </View>
          <MaterialCommunityIcons name="pill" size={56} color={colors.pharmacyColor} style={{ opacity: 0.2 }} />
        </View>

        {/* CTA - صرف وصفة */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/(pharmacy)/prescriptions')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.pharmacyColor, '#0D9373']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.ctaIcon}>
            <Ionicons name="scan-outline" size={32} color={colors.white} />
          </View>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>صرف وصفة طبية</Text>
            <Text style={styles.ctaSub}>ابحث برقم المريض أو كود الوصفة</Text>
          </View>
          <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>نشاط اليوم</Text>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.statCard}>
                <Skeleton width={40} height={40} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width="50%" height={28} style={{ marginBottom: 8 }} />
                <Skeleton width="80%" height={14} />
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
                <View style={[styles.iconBox, { backgroundColor: `${card.color}20` }]}>
                  <Ionicons name={card.icon as any} size={22} color={card.color} />
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statTitle}>{card.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Links */}
        <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 16 }]}>وصول سريع</Text>
        
        <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(pharmacy)/prescriptions' as any)} activeOpacity={0.8}>
          <View style={[styles.linkIcon, { backgroundColor: `${colors.pharmacyColor}15` }]}>
            <Ionicons name="document-text" size={24} color={colors.pharmacyColor} />
          </View>
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>الوصفات الطبية</Text>
            <Text style={styles.linkSub}>عرض وإدارة جميع الوصفات الواردة</Text>
          </View>
          <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/(pharmacy)/inventory' as any)} activeOpacity={0.8}>
          <View style={[styles.linkIcon, { backgroundColor: `${colors.info}15` }]}>
            <Ionicons name="medkit" size={24} color={colors.info} />
          </View>
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>إدارة المخزون</Text>
            <Text style={styles.linkSub}>الأدوية، الجرد، ونواقص المخزون</Text>
          </View>
          <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>ربط التأمين الطبي</Text>
            <Text style={styles.noticeSub}>
              تم تفعيل ميزة قراءة الموافقات الطبية لشركات التأمين مباشرة عبر نظام Doctor Jo.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 50 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.pharmacyColor}20`, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: `${colors.pharmacyColor}50` },
  
  welcomeBanner: {
    borderRadius: 24, padding: 24, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden', borderWidth: 1, borderColor: `${colors.pharmacyColor}30`,
  },
  bannerContent: { flex: 1 },
  bannerGreeting: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  bannerName: { fontFamily: 'Cairo-Bold', fontSize: 22, color: colors.textMain, marginBottom: 4 },
  bannerSub: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.pharmacyColor },

  ctaCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, padding: 20, marginBottom: 24,
    overflow: 'hidden', gap: 16,
    shadowColor: colors.pharmacyColor,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  ctaIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  ctaContent: { flex: 1 },
  ctaTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.white, marginBottom: 4 },
  ctaSub: { fontFamily: 'Cairo-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { 
    width: '47%', padding: 18, borderRadius: 20, 
    backgroundColor: colors.surface, borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  statValue: { fontFamily: 'Cairo-Bold', fontSize: 26, color: colors.textMain, marginBottom: 4 },
  statTitle: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },

  linkCard: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: colors.surface, padding: 18, borderRadius: 20, 
    borderWidth: 1, borderColor: colors.borderLight, gap: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  linkIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  linkContent: { flex: 1 },
  linkTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  linkSub: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  noticeCard: { 
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: `${colors.info}10`, borderRadius: 16, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: `${colors.info}20`,
  },
  noticeContent: { flex: 1 },
  noticeTitle: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain, marginBottom: 4 },
  noticeSub: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
