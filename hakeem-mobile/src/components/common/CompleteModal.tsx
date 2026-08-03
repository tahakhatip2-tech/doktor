import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Input, Button } from './index';
import { colors } from '../../theme/colors';

interface Medication {
  name: string;
  type: string;
  frequency: string;
  duration: string;
}

interface CompleteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    diagnosis: string;
    treatment: string;
    feeAmount: string;
    feeDetails?: string;
    nationalId?: string;
    age?: string;
    medications?: Medication[];
    sickLeaveDays?: string;
    sickLeaveReason?: string;
    referralTo?: string;
    referralReason?: string;
  }) => void;
  isLoading?: boolean;
  patientName?: string;
  appointmentId?: number;
}

const MED_TYPES = ['حبوب', 'شرب', 'كبسول', 'مرهم/كريم', 'حقنة', 'قطرة', 'بخاخ', 'أخرى'];

const EMPTY_MED: Medication = { name: '', type: 'حبوب', frequency: '', duration: '' };

export function CompleteModal({
  visible, onClose, onSubmit, isLoading = false,
  patientName, appointmentId,
}: CompleteModalProps) {
  const [diagnosis, setDiagnosis]       = useState('');
  const [treatment, setTreatment]       = useState('');
  const [feeAmount, setFeeAmount]       = useState('');
  const [feeDetails, setFeeDetails]     = useState('كشفية طبية');
  const [nationalId, setNationalId]     = useState('');
  const [age, setAge]                   = useState('');
  const [medications, setMedications]   = useState<Medication[]>([{ ...EMPTY_MED }]);

  const [showSickLeave, setShowSickLeave]   = useState(false);
  const [sickLeaveDays, setSickLeaveDays]   = useState('');
  const [sickLeaveReason, setSickLeaveReason] = useState('');

  const [showReferral, setShowReferral]     = useState(false);
  const [referralTo, setReferralTo]         = useState('');
  const [referralReason, setReferralReason] = useState('');

  const reset = () => {
    setDiagnosis(''); setTreatment(''); setFeeAmount('');
    setFeeDetails('كشفية طبية'); setNationalId(''); setAge('');
    setMedications([{ ...EMPTY_MED }]);
    setShowSickLeave(false); setSickLeaveDays(''); setSickLeaveReason('');
    setShowReferral(false); setReferralTo(''); setReferralReason('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    onSubmit({
      diagnosis, treatment, feeAmount, feeDetails,
      nationalId: nationalId || undefined,
      age: age || undefined,
      medications: medications.filter(m => m.name.trim()),
      sickLeaveDays: showSickLeave ? sickLeaveDays : undefined,
      sickLeaveReason: showSickLeave ? sickLeaveReason : undefined,
      referralTo: showReferral ? referralTo : undefined,
      referralReason: showReferral ? referralReason : undefined,
    });
  };

  const updateMed = (i: number, field: keyof Medication, val: string) => {
    setMedications(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const addMed    = () => setMedications(prev => [...prev, { ...EMPTY_MED }]);
  const removeMed = (i: number) => setMedications(prev =>
    prev.length === 1 ? [{ ...EMPTY_MED }] : prev.filter((_, idx) => idx !== i)
  );

  const isValid = diagnosis.trim() !== '' && feeAmount.trim() !== '';

  return (
    <Modal visible={visible} onClose={handleClose} size="lg">
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 620 }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="checkmark-done-circle" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>إتمام الزيارة والتوثيق الطبي</Text>
          {patientName ? <Text style={styles.subtitle}>{patientName} • موعد #{appointmentId}</Text> : null}
        </View>

        {/* ── بيانات المريض ── */}
        <SectionHeader icon="person-outline" color={colors.primary} title="بيانات المريض" />
        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Input label="الرقم الوطني" placeholder="اختياري" value={nationalId} onChangeText={setNationalId} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="العمر" placeholder="مثال: 25 سنة" value={age} onChangeText={setAge} />
          </View>
        </View>

        {/* ── التشخيص ── */}
        <SectionHeader icon="clipboard-outline" color={colors.primary} title="التشخيص الطبي" />
        <Input
          label="التشخيص (مطلوب)"
          placeholder="اكتب التشخيص التفصيلي..."
          value={diagnosis}
          onChangeText={setDiagnosis}
          multiline
          numberOfLines={3}
        />

        {/* ── الأدوية ── */}
        <SectionHeader icon="medkit-outline" color="#f59e0b" title="الأدوية الموصوفة" />
        {medications.map((med, i) => (
          <View key={i} style={styles.medCard}>
            <View style={styles.medCardHeader}>
              <Text style={styles.medCardNum}>دواء {i + 1}</Text>
              <TouchableOpacity onPress={() => removeMed(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>

            <Input label="اسم الدواء" placeholder="مثال: Panadol" value={med.name}
              onChangeText={v => updateMed(i, 'name', v)} />

            {/* نوع الدواء */}
            <Text style={styles.inputLabel}>النوع</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={styles.typeRow}>
                {MED_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, med.type === t && styles.typeChipActive]}
                    onPress={() => updateMed(i, 'type', t)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipText, med.type === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Input label="الجرعة والتكرار" placeholder="مثال: حبة كل 12 ساعة"
                  value={med.frequency} onChangeText={v => updateMed(i, 'frequency', v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="المدة" placeholder="مثال: 5 أيام"
                  value={med.duration} onChangeText={v => updateMed(i, 'duration', v)} />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMedBtn} onPress={addMed} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.addMedText}>إضافة دواء آخر</Text>
        </TouchableOpacity>

        {/* ── تعليمات عامة ── */}
        <Input
          label="تعليمات وملاحظات عامة (اختياري)"
          placeholder="اكتب أي تعليمات للمريض..."
          value={treatment}
          onChangeText={setTreatment}
          multiline
          numberOfLines={2}
        />

        {/* ── إجازة مرضية ── */}
        <SectionHeader icon="bed-outline" color="#8b5cf6" title="إضافات اختيارية" />

        <ToggleSection
          label="إضافة إجازة مرضية"
          icon="document-text-outline"
          iconColor={colors.primary}
          value={showSickLeave}
          onChange={setShowSickLeave}
        >
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Input label="مدة الإجازة (أيام)" placeholder="مثال: 3"
                value={sickLeaveDays} onChangeText={setSickLeaveDays} keyboardType="numeric" />
            </View>
            <View style={{ flex: 2 }}>
              <Input label="السبب الطبي" placeholder="اذكر السبب..."
                value={sickLeaveReason} onChangeText={setSickLeaveReason} />
            </View>
          </View>
        </ToggleSection>

        {/* ── تحويل طبي ── */}
        <ToggleSection
          label="إضافة تحويل طبي"
          icon="arrow-redo-outline"
          iconColor="#f59e0b"
          value={showReferral}
          onChange={setShowReferral}
        >
          <Input label="الجهة المحول إليها" placeholder="مثال: د. أحمد (باطنية)"
            value={referralTo} onChangeText={setReferralTo} />
          <Input label="سبب التحويل" placeholder="اذكر سبب التحويل..."
            value={referralReason} onChangeText={setReferralReason} />
        </ToggleSection>

        {/* ── المحاسبة ── */}
        <SectionHeader icon="receipt-outline" color={colors.success} title="المحاسبة والفاتورة" />
        <View style={styles.feeCard}>
          <Input
            label="قيمة الكشفية (مطلوب)"
            placeholder="0.00"
            value={feeAmount}
            onChangeText={setFeeAmount}
            keyboardType="numeric"
          />
          <Input
            label="توصيف الدفعة"
            placeholder="مثال: كشفية عامة، فحص أشعة..."
            value={feeDetails}
            onChangeText={setFeeDetails}
          />
        </View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isLoading}>
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>
          <Button
            title="حفظ وإتمام الموعد"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!isValid || isLoading}
            style={{ flex: 2 }}
            icon={<Ionicons name="save-outline" size={18} color="#fff" />}
          />
        </View>

      </ScrollView>
    </Modal>
  );
}

// ── مكونات مساعدة ──

function SectionHeader({ icon, color, title }: { icon: any; color: string; title: string }) {
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

function ToggleSection({ label, icon, iconColor, value, onChange, children }: {
  label: string; icon: any; iconColor: string;
  value: boolean; onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <View style={[toggleStyles.wrapper, value && { borderColor: `${iconColor}50`, backgroundColor: `${iconColor}08` }]}>
      <View style={toggleStyles.row}>
        <View style={toggleStyles.labelRow}>
          <Ionicons name={icon} size={16} color={iconColor} />
          <Text style={toggleStyles.label}>{label}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: iconColor, false: '#e2e8f0' }}
          thumbColor="#fff"
        />
      </View>
      {value && <View style={toggleStyles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 20, gap: 6 },
  headerIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, textAlign: 'center' },
  subtitle: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary },

  row2: { flexDirection: 'row', gap: 10 },

  // Medication card
  medCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  medCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  medCardNum: { fontFamily: 'Cairo-Bold', fontSize: 13, color: colors.textSecondary },
  inputLabel: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textMain, marginBottom: 6 },
  typeRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary },
  typeChipTextActive: { color: '#fff', fontFamily: 'Cairo-SemiBold' },

  addMedBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, marginBottom: 16,
    borderRadius: 12, borderWidth: 1.5, borderColor: `${colors.primary}40`,
    borderStyle: 'dashed', backgroundColor: `${colors.primary}05`,
  },
  addMedText: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.primary },

  feeCard: {
    backgroundColor: `${colors.success}08`,
    borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: `${colors.success}25`,
    gap: 4,
  },

  actions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
  },
  cancelText: { fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textSecondary },
});

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 16, marginBottom: 10,
    paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  title: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain },
});

const toggleStyles = StyleSheet.create({
  wrapper: {
    borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
    marginBottom: 10, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 14,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textMain },
  content: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
});
