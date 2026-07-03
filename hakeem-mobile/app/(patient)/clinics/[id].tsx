import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { clinicsApi } from '../../../src/api/modules.api';
import { patientAppointmentsApi } from '../../../src/api/appointments.api';
import { Clinic } from '../../../src/types/clinic.types';
import { Button, Input, ScreenHeader, Modal, useToast, Toast } from '../../../src/components/common';

// -- دوال مساعدة للتاريخ والوقت --
function getNextDays(days = 7) {
  const result = [];
  const date = new Date();
  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  for (let i = 0; i < days; i++) {
    const current = new Date(date);
    current.setDate(date.getDate() + i);
    result.push({
      dateStr: current.toISOString().split('T')[0],
      dayName: i === 0 ? 'اليوم' : i === 1 ? 'غداً' : dayNames[current.getDay()],
      dayNum: current.getDate(),
      month: monthNames[current.getMonth()]
    });
  }
  return result;
}

const MOCK_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '06:00 PM'];

export default function ClinicDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  // -- حالة الحجز --
  const nextDays = getNextDays(7);
  const [selectedDate, setSelectedDate] = useState(nextDays[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  useEffect(() => {
    fetchClinic();
  }, [id]);

  const fetchClinic = async () => {
    try {
      setIsLoading(true);
      const res = await clinicsApi.getById(Number(id));
      setClinic(res.data);
    } catch (err) {
      showToast('حدث خطأ أثناء جلب بيانات العيادة', 'error');
      setTimeout(() => router.back(), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);
      // تحويل AM/PM إلى 24h
      const [time, modifier] = selectedSlot.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      
      const appointmentDate = new Date(`${selectedDate}T${hours.padStart(2, '0')}:${minutes}:00`).toISOString();
      
      await patientAppointmentsApi.create({
        clinicId: Number(id),
        appointmentDate,
        notes,
        type: 'consultation',
      });
      
      setIsConfirmModalVisible(false);
      showToast('تم حجز الموعد بنجاح', 'success');
      
      setTimeout(() => {
        router.push('/(patient)/appointments');
      }, 1500);
      
    } catch (err) {
      setIsConfirmModalVisible(false);
      showToast('حدث خطأ أثناء الحجز، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const onBookPress = () => {
    if (!selectedSlot) {
      showToast('الرجاء اختيار وقت الموعد أولاً', 'warning');
      return;
    }
    setIsConfirmModalVisible(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!clinic) return null;

  const isPharmacy = (clinic as any).role === 'PHARMACY';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title={clinic.name ?? 'عيادة'} showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* معلومات العيادة العلوية */}
        <View style={styles.headerProfile}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoEmoji}>{clinic.metadata?.icon || (isPharmacy ? '💊' : '🏥')}</Text>
          </View>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <Text style={styles.specialty}>{clinic.metadata?.specialty || (isPharmacy ? 'صيدلية' : 'تخصص عام')}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statValue}>{clinic.metadata?.rating || '4.8'}</Text>
              <Text style={styles.statLabel}>(124 تقييم)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={styles.statValue}>10 ص - 10 م</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => router.push(`/(patient)/chat/${clinic.id}` as any)}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
              <Text style={styles.actionBtnText}>مراسلة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnSecondary}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnSecondary}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {isPharmacy ? (
          <View style={styles.section}>
             <View style={styles.pharmacyCard}>
                <Ionicons name="document-text-outline" size={32} color={colors.accent} />
                <Text style={styles.pharmacyTitle}>لديك وصفة طبية؟</Text>
                <Text style={styles.pharmacyDesc}>قم بإرسال الوصفة الطبية للصيدلية لتحضير الدواء قبل وصولك.</Text>
                <Button 
                  title="صرف وصفة طبية" 
                  onPress={() => showToast('سيتم إضافة صرف الوصفة لاحقاً', 'info')} 
                  variant="accent"
                  style={{ marginTop: 16 }}
                />
             </View>
          </View>
        ) : (
          <>
            {/* التقويم والأوقات */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>احجز موعداً</Text>
                <Text style={styles.sectionSubtitle}>اختر اليوم المناسب</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
                {nextDays.map(day => {
                  const isActive = selectedDate === day.dateStr;
                  return (
                    <TouchableOpacity
                      key={day.dateStr}
                      style={[styles.dayCard, isActive && styles.dayCardActive]}
                      onPress={() => {
                        setSelectedDate(day.dateStr);
                        setSelectedSlot(''); // تصفير الوقت عند تغيير اليوم
                      }}
                    >
                      <Text style={[styles.dayName, isActive && styles.textActive]}>{day.dayName}</Text>
                      <Text style={[styles.dayNum, isActive && styles.textActive]}>{day.dayNum}</Text>
                      <Text style={[styles.dayMonth, isActive && styles.textActive]}>{day.month}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>الأوقات المتاحة</Text>
              <View style={styles.slotsGrid}>
                {MOCK_SLOTS.map(slot => {
                  const isActive = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.slotCard, isActive && styles.slotCardActive]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[styles.slotText, isActive && styles.slotTextActive]}>{slot}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Input
                label="ملاحظات للطبيب (اختياري)"
                placeholder="أخبر الطبيب عن حالتك أو أي تفاصيل مهمة..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* زر الحجز العائم */}
      {!isPharmacy && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarPrice}>
            <Text style={styles.priceLabel}>سعر الكشفية</Text>
            <Text style={styles.priceValue}>{clinic.metadata?.price || '25'} دينار</Text>
          </View>
          <Button 
            title="حجز موعد" 
            onPress={onBookPress} 
            style={styles.bookBtn}
          />
        </View>
      )}

      {/* مودال التأكيد */}
      <Modal visible={isConfirmModalVisible} onClose={() => setIsConfirmModalVisible(false)} size="sm">
        <View style={styles.confirmModal}>
          <View style={styles.confirmIcon}>
            <Ionicons name="calendar" size={32} color={colors.primary} />
          </View>
          <Text style={styles.confirmTitle}>تأكيد الحجز</Text>
          <Text style={styles.confirmDesc}>
            سيتم حجز موعد في {clinic.name} يوم {nextDays.find(d => d.dateStr === selectedDate)?.dayName} الساعة {selectedSlot}.
          </Text>
          
          <View style={styles.confirmActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsConfirmModalVisible(false)}>
              <Text style={styles.cancelBtnText}>تراجع</Text>
            </TouchableOpacity>
            <Button title="تأكيد الموعد" onPress={handleConfirmBooking} loading={isBooking} style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>

      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerProfile: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  },
  logoEmoji: {
    fontSize: 40,
  },
  clinicName: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: colors.textMain,
    marginBottom: 4,
  },
  specialty: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.primary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.textMain,
  },
  statLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.white,
  },
  actionBtnSecondary: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  daysContainer: {
    gap: 12,
    paddingBottom: 10,
  },
  dayCard: {
    width: 72,
    height: 90,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dayCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  dayNum: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: colors.textMain,
  },
  dayMonth: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.white,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '30%',
    flexGrow: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  slotCardActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  slotText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: colors.textMain,
  },
  slotTextActive: {
    color: colors.primary,
    fontFamily: 'Cairo-Bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30, // for safe area
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomBarPrice: {
    flex: 1,
  },
  priceLabel: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  priceValue: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
  },
  bookBtn: {
    flex: 2,
  },
  confirmModal: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  confirmIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    marginBottom: 8,
  },
  confirmDesc: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 15,
    color: colors.textMain,
  },
  pharmacyCard: {
    backgroundColor: `${colors.accent}10`,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  pharmacyTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    marginTop: 8,
  },
  pharmacyDesc: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
