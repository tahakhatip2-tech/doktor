import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/auth.store';
import { colors } from '../../src/theme/colors';
import {
  Card, AppointmentCard, AppointmentSkeleton,
  EmptyState, StatusBadge,
} from '../../src/components/common';
import { patientAppointmentsApi } from '../../src/api/appointments.api';
import { notificationsApi } from '../../src/api/modules.api';

export default function PatientHome() {
  const { patientUser } = useAuthStore() as any;
  const router = useRouter();

  // جلب المواعيد القادمة
  const {
    data: appointments,
    isLoading: loadingAppointments,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ['patient-upcoming'],
    queryFn: () => patientAppointmentsApi.getUpcoming().then(r => r.data),
  });

  // جلب الإشعارات
  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['patient-notifications-home'],
    queryFn: () => notificationsApi.getAll().then(r => r.data),
  });

  // عداد الإشعارات غير المقروءة
  const { data: unreadCount } = useQuery({
    queryKey: ['patient-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount().then(r => r.data.count),
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAppointments();
    setRefreshing(false);
  }, []);

  const upcomingList = (appointments || []).slice(0, 3);
  const recentNotifications = (notifications || []).slice(0, 4);
  const firstName = patientUser?.fullName?.split(' ')[0] || patientUser?.name?.split(' ')[0] || 'مريض';

  const quickServices = [
    { id: 'clinics', title: 'العيادات', icon: 'medical-outline' as const, color: colors.accent, route: '/(patient)/clinics' },
    { id: 'appointments', title: 'مواعيدي', icon: 'calendar-outline' as const, color: colors.accent, route: '/(patient)/appointments' },
    { id: 'records', title: 'سجلاتي', icon: 'document-text-outline' as const, color: colors.success, route: '/(patient)/medical-records' },
    { id: 'offers', title: 'العروض', icon: 'gift-outline' as const, color: '#8B5CF6', route: '/(patient)/offers' },
    { id: 'chat', title: 'محادثاتي', icon: 'chatbubbles-outline' as const, color: '#EC4899', route: '/(patient)/chat' },
    { id: 'profile', title: 'حسابي', icon: 'person-outline' as const, color: colors.info, route: '/(patient)/profile' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.greeting}>مرحباً بك،</Text>
              <Text style={styles.userName}>{firstName} 👋</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/(patient)/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textMain} />
              {unreadCount && unreadCount > 0 ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push('/(patient)/profile')}
            >
              <MaterialCommunityIcons name="account" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* ── Hero Card ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroIcon}>
                <Ionicons name="add-circle-outline" size={32} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>احجز موعداً جديداً</Text>
                <Text style={styles.heroSubtitle}>
                  ابحث عن أفضل الأطباء واحجز موعدك بسهولة
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push('/(patient)/clinics')}
              activeOpacity={0.85}
            >
              <Ionicons name="search-outline" size={16} color={colors.white} />
              <Text style={styles.heroBtnText}>ابحث عن عيادة</Text>
            </TouchableOpacity>
          </View>

          {/* ── الخدمات السريعة ── */}
          <Text style={styles.sectionTitle}>الخدمات السريعة</Text>
          <View style={styles.servicesGrid}>
            {quickServices.map(service => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push(service.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${service.color}18` }]}>
                  <Ionicons name={service.icon} size={24} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── المواعيد القادمة ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المواعيد القادمة</Text>
            <TouchableOpacity onPress={() => router.push('/(patient)/appointments')}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {loadingAppointments ? (
            <>
              <AppointmentSkeleton />
              <AppointmentSkeleton />
            </>
          ) : upcomingList.length === 0 ? (
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="calendar-clear-outline"
                title="لا توجد مواعيد قادمة"
                subtitle="قم بحجز موعدك الأول من خلال البحث عن عيادة"
              />
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {upcomingList.map(appt => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onPress={() => router.push(`/(patient)/appointments/${appt.id}` as any)}
                  viewAs="patient"
                />
              ))}
            </View>
          )}

          {/* ── آخر الإشعارات ── */}
          {recentNotifications.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Text style={styles.sectionTitle}>آخر الإشعارات</Text>
                <TouchableOpacity onPress={() => router.push('/(patient)/notifications')}>
                  <Text style={styles.seeAll}>عرض الكل</Text>
                </TouchableOpacity>
              </View>
              <View style={{ gap: 8 }}>
                {recentNotifications.map(notif => (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.notifCard,
                      !notif.isRead && styles.notifCardUnread,
                    ]}
                    onPress={() => router.push('/(patient)/notifications')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.notifDot, !notif.isRead && styles.notifDotActive]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      <Text style={styles.notifMsg} numberOfLines={2}>
                        {notif.message}
                      </Text>
                    </View>
                    {!notif.isRead && (
                      <View style={styles.unreadDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.accent}60`,
  },
  greeting: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary },
  userName: { fontFamily: 'Cairo-Bold', fontSize: 17, color: colors.textMain },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  notifBadgeText: { fontFamily: 'Cairo-Bold', fontSize: 9, color: colors.white },
  content: { padding: 20, gap: 8, paddingBottom: 40 },

  // Hero
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: `${colors.accent}40`,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
  },
  heroTitle: { fontFamily: 'Cairo-Bold', fontSize: 17, color: colors.textMain, marginBottom: 4 },
  heroSubtitle: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  heroBtnText: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.white },

  // Services
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  serviceCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    color: colors.textMain,
    textAlign: 'center',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    marginTop: 8,
    marginBottom: 4,
  },
  seeAll: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.accent },

  // Empty
  emptyCard: { padding: 0 },

  // Notifications
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  notifCardUnread: {
    borderColor: `${colors.accent}40`,
    backgroundColor: `${colors.accent}06`,
  },
  notifDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textMuted,
    marginTop: 5,
  },
  notifDotActive: { backgroundColor: colors.accent, shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  notifTitle: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain, marginBottom: 4 },
  notifMsg: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginTop: 5,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});
