import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { 
  AppointmentCard, ScreenHeader, EmptyState, 
  AppointmentSkeleton, ConfirmModal, useToast, Toast
} from '../../../src/components/common';
import { patientAppointmentsApi } from '../../../src/api/appointments.api';
import { Appointment } from '../../../src/types/appointment.types';
import { getErrorMessage } from '../../../src/api/client';

type FilterType = 'upcoming' | 'past' | 'all';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  
  // -- الإلغاء --
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = filter === 'upcoming' 
        ? await patientAppointmentsApi.getUpcoming()
        : await patientAppointmentsApi.getAll();
      
      // إذا كان الفلتر 'past' نصفي القائمة محلياً من السجل الكامل (لأنه لا يوجد endpoint خاص بـ past)
      let data = res.data;
      if (filter === 'past') {
        const now = new Date();
        data = data.filter((a: Appointment) => new Date(a.appointmentDate) < now || a.status === 'completed' || a.status === 'cancelled');
      }

      setAppointments(data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      setIsCancelling(true);
      await patientAppointmentsApi.cancel(cancelId, { reason: 'إلغاء من قبل المريض' });
      setCancelId(null);
      showToast('تم إلغاء الموعد بنجاح', 'success');
      fetchAppointments();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const FILTERS = [
    { id: 'upcoming', label: 'القادمة' },
    { id: 'past', label: 'السابقة' },
    { id: 'all', label: 'الكل' },
  ] as const;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="سجل المواعيد" showBack />
      
      <View style={styles.header}>
        <View style={styles.filtersRow}>
          {FILTERS.map(f => (
            <TouchableOpacity 
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
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
              viewAs="patient"
              onPress={() => router.push(`/(patient)/appointments/${item.id}` as any)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-clear-outline"
              title="لا توجد مواعيد"
              subtitle={filter === 'upcoming' ? 'لا توجد لديك أي مواعيد قادمة مجدولة' : 'لم يتم العثور على أي مواعيد في سجلك'}
            />
          }
        />
      )}

      <ConfirmModal
        visible={!!cancelId}
        title="إلغاء الموعد"
        message="هل أنت متأكد أنك تريد إلغاء هذا الموعد نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، إلغاء الموعد"
        cancelText="تراجع"
        confirmVariant="danger"
        loading={isCancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelId(null)}
      />

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
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
});
