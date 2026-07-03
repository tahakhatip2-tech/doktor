import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { ScreenHeader, AppointmentCard, AppointmentSkeleton, EmptyState, useToast, Toast } from '../../../src/components/common';
import { doctorAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { getErrorMessage } from '../../../src/api/client';

type TabType = 'pending' | 'confirmed' | 'all';

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await doctorAppointmentsApi.getAll(params);
      
      // إذا كان الفلتر all يمكننا عرض الكل وتصفيتها لو أردنا، هنا السيرفر يدعم الفلتر
      setAppointments(res.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const TABS = [
    { id: 'pending', label: 'طلبات جديدة' },
    { id: 'confirmed', label: 'مؤكدة' },
    { id: 'all', label: 'الكل' },
  ] as const;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="إدارة المواعيد" showBack={false} />
      
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setActiveTab(tab.id as TabType)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.listContainer}>
          <AppointmentSkeleton />
          <AppointmentSkeleton />
          <AppointmentSkeleton />
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item as any}
              viewAs="doctor"
              onPress={() => router.push(`/(doctor)/appointments/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-clear-outline"
              title="لا توجد مواعيد"
              subtitle={
                activeTab === 'pending' ? 'لا توجد طلبات مواعيد جديدة قيد الانتظار' :
                activeTab === 'confirmed' ? 'لا توجد مواعيد مؤكدة' :
                'لم يتم العثور على أي مواعيد'
              }
            />
          }
        />
      )}

      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
});
