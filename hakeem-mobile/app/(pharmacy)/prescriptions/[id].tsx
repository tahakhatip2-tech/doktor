import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { AppHeader, Card, Button, StatusBadge, ConfirmModal, useToast, Toast } from '../../../src/components/common';

export default function PrescriptionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { toast, show, hide } = useToast();
  
  const [prescription, setPrescription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dispenseModal, setDispenseModal] = useState(false);
  const [isDispensing, setIsDispensing] = useState(false);

  useEffect(() => {
    // محاكاة جلب تفاصيل الوصفة
    setTimeout(() => {
      setPrescription({
        id,
        patientName: 'أحمد محمود',
        patientId: '1092837465',
        doctorName: 'د. خالد سعيد',
        specialty: 'باطنية',
        date: '2026-06-15',
        status: 'pending',
        notes: 'يرجى مراجعة العيادة بعد أسبوعين في حال استمرار الأعراض.',
        items: [
          { name: 'Amoxil 500mg', dosage: '1 حبة كل 8 ساعات', duration: '7 أيام', inStock: true },
          { name: 'Panadol Advance', dosage: 'حبتين عند اللزوم', duration: '-', inStock: true },
          { name: 'Vitamin C 1000mg', dosage: 'حبة فوارة يومياً', duration: '14 يوم', inStock: false },
        ]
      });
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleDispense = () => {
    setIsDispensing(true);
    setTimeout(() => {
      setIsDispensing(false);
      setDispenseModal(false);
      setPrescription({ ...prescription, status: 'dispensed' });
      show('تم صرف الوصفة وتحديث مخزون الأدوية بنجاح', 'success');
    }, 1500);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.success} />
      </SafeAreaView>
    );
  }

  if (!prescription) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={`وصفة رقم ${id}`} showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header Info */}
        <Card style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.cardTitle}>تفاصيل الوصفة</Text>
            <StatusBadge status={prescription.status} size="md" />
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>اسم المريض:</Text>
            <Text style={styles.infoValue}>{prescription.patientName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>رقم الهوية:</Text>
            <Text style={styles.infoValue}>{prescription.patientId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الطبيب المعالج:</Text>
            <Text style={styles.infoValue}>{prescription.doctorName} ({prescription.specialty})</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تاريخ الإصدار:</Text>
            <Text style={styles.infoValue}>{prescription.date}</Text>
          </View>
        </Card>

        {/* Medicines List */}
        <Text style={styles.sectionTitle}>الأدوية المطلوبة</Text>
        <Card style={styles.itemsCard}>
          {prescription.items.map((item: any, idx: number) => (
            <View key={idx} style={[styles.medItem, idx !== prescription.items.length - 1 && styles.borderBottom]}>
              <View style={styles.medHeaderRow}>
                <Ionicons name="medical" size={18} color={colors.primary} />
                <Text style={styles.medName}>{item.name}</Text>
                {item.inStock ? (
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>متوفر</Text>
                  </View>
                ) : (
                  <View style={[styles.stockBadge, { backgroundColor: `${colors.error}15` }]}>
                    <Text style={[styles.stockText, { color: colors.error }]}>غير متوفر</Text>
                  </View>
                )}
              </View>
              <View style={styles.medDetails}>
                <Text style={styles.medDosage}>الجرعة: {item.dosage}</Text>
                <Text style={styles.medDuration}>المدة: {item.duration}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Doctor Notes */}
        {prescription.notes && (
          <View style={styles.notesBox}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMain} />
              <Text style={styles.notesTitle}>ملاحظات الطبيب للصيدلي:</Text>
            </View>
            <Text style={styles.notesText}>{prescription.notes}</Text>
          </View>
        )}

      </ScrollView>

      {/* Action Footer */}
      {prescription.status === 'pending' && (
        <View style={styles.footer}>
          <Button 
            title="إتمام وصرف الأدوية المتوفرة" 
            style={{ backgroundColor: colors.success, borderColor: colors.success }}
            icon={<Ionicons name="scan" size={20} color={colors.white} />}
            onPress={() => setDispenseModal(true)} 
          />
        </View>
      )}

      {/* Dispense Confirmation Modal */}
      <ConfirmModal
        visible={dispenseModal}
        title="تأكيد الصرف"
        message="هل أنت متأكد من صرف الأدوية المتوفرة لهذه الوصفة؟ سيتم خصم الكميات من المخزون تلقائياً وإشعار النظام بأن الوصفة قد صرفت."
        confirmText="نعم، تأكيد الصرف"
        confirmVariant="primary"
        onConfirm={handleDispense}
        onClose={() => setDispenseModal(false)}
        loading={isDispensing}
      />

      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  card: { padding: 20, marginBottom: 24, borderColor: colors.success },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  infoValue: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textMain },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 16, textAlign: 'left' },
  itemsCard: { padding: 16, marginBottom: 24 },
  medItem: { paddingVertical: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  medHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  medName: { flex: 1, fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain, textAlign: 'left' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: `${colors.success}15`, borderRadius: 8 },
  stockText: { fontFamily: 'Cairo-SemiBold', fontSize: 11, color: colors.success },
  medDetails: { paddingRight: 26 },
  medDosage: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left', marginBottom: 2 },
  medDuration: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'left' },
  notesBox: { backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.borderLight },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  notesTitle: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain },
  notesText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, lineHeight: 24 },
  footer: { padding: 20, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
