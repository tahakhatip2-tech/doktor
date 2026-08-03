import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { AppHeader, useToast, Toast } from '../../../src/components/common';
import { medicalRecordsApi } from '../../../src/api/modules.api';
import { getErrorMessage } from '../../../src/api/client';

// Record type config
const RECORD_TYPES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  prescription: { label: 'وصفة طبية', icon: 'document-text', color: '#10B981', bg: '#10B98115' },
  report:       { label: 'تقرير طبي', icon: 'clipboard',      color: '#3B82F6', bg: '#3B82F615' },
  xray:         { label: 'أشعة وتحاليل', icon: 'body',        color: '#8B5CF6', bg: '#8B5CF615' },
  default:      { label: 'سجل طبي',    icon: 'medkit',        color: '#F59E0B', bg: '#F59E0B15' },
};

const FILTERS = ['الكل', 'وصفات', 'تقارير', 'أشعة'];
const FILTER_MAP: Record<string, string | null> = {
  'الكل': null, 'وصفات': 'prescription', 'تقارير': 'report', 'أشعة': 'xray',
};

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('الكل');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    try {
      setErrorMsg(null);
      const res = await medicalRecordsApi.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setRecords(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchRecords(); }, [fetchRecords]));

  const onRefresh = () => { setRefreshing(true); fetchRecords(); };

  // ─── Filtered data ─────────────────────────────────────────────────────────
  const filteredRecords = records.filter(r => {
    const type = FILTER_MAP[activeFilter];
    return type ? r.recordType === type : true;
  });

  // ─── Share prescription ────────────────────────────────────────────────────
  const sharePrescription = async (item: any) => {
    const clinicName = item.appointment?.user?.clinic_name || item.appointment?.user?.name || 'العيادة';
    const date = new Date(item.createdAt).toLocaleDateString('ar-SA');
    let text = `📋 وصفة طبية من ${clinicName}\n📅 التاريخ: ${date}\n\n`;
    if (item.diagnosis) text += `🔍 التشخيص: ${item.diagnosis}\n`;
    if (item.treatment) text += `💊 العلاج: ${item.treatment}\n`;
    if (item.aiAdvice) text += `\n🤖 نصائح الذكاء الاصطناعي:\n${item.aiAdvice}`;
    await Share.share({ message: text });
  };

  // ─── Card ──────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    const typeKey = item.recordType || 'default';
    const cfg = RECORD_TYPES[typeKey] || RECORD_TYPES.default;
    const date = new Date(item.createdAt).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const doctorName  = item.appointment?.user?.name || '—';
    const clinicName  = item.appointment?.user?.clinic_name || '—';
    const specialty   = item.appointment?.user?.clinic_specialty || '';
    const fee         = Number(item.feeAmount) || 0;

    return (
      <View style={styles.card}>
        {/* ── Header ── */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={22} color={cfg.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
          {fee > 0 && (
            <View style={styles.feeBadge}>
              <Text style={styles.feeText}>{fee} د</Text>
            </View>
          )}
        </View>

        {/* ── Clinic / Doctor ── */}
        <View style={styles.clinicRow}>
          <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.clinicName}>{clinicName}</Text>
          {specialty ? <Text style={styles.specialtyText}> · {specialty}</Text> : null}
        </View>
        <View style={styles.clinicRow}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.clinicName}>{doctorName}</Text>
        </View>

        <View style={styles.divider} />

        {/* ── Diagnosis ── */}
        {item.diagnosis ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Ionicons name="search-outline" size={15} color={colors.primary} />
              <Text style={styles.sectionTitle}>التشخيص</Text>
            </View>
            <Text style={styles.sectionBody}>{item.diagnosis}</Text>
          </View>
        ) : null}

        {/* ── Treatment ── */}
        {item.treatment ? (
          <View style={[styles.section, { backgroundColor: `${colors.success}0A` }]}>
            <View style={styles.sectionHead}>
              <Ionicons name="flask-outline" size={15} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.success }]}>العلاج / الدواء</Text>
            </View>
            <Text style={styles.sectionBody}>{item.treatment}</Text>
          </View>
        ) : null}

        {/* ── AI Advice badge ── */}
        {item.aiAdvice ? (
          <View style={styles.aiRow}>
            <Ionicons name="sparkles" size={14} color="#8B5CF6" />
            <Text style={styles.aiLabel}>توجد نصيحة ذكاء اصطناعي</Text>
          </View>
        ) : null}

        {/* ── Actions ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push(`/(patient)/medical-records/${item.id}` as any)}
          >
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text style={styles.primaryBtnText}>عرض التفاصيل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => sharePrescription(item)}>
            <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Main ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="السجلات والوصفات" showBack />

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersInner}>
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stats badge */}
        {!isLoading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredRecords.length}</Text>
          </View>
        )}
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={48} color={colors.primary} style={{ opacity: 0.5 }} />
          <Text style={styles.loadingText}>جاري تحميل السجلات...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name={errorMsg ? 'warning-outline' : 'document-text-outline'}
                size={64}
                color={errorMsg ? colors.error : colors.border}
              />
              <Text style={[styles.emptyTitle, errorMsg && { color: colors.error }]}>
                {errorMsg ? 'حدث خطأ' : activeFilter === 'الكل' ? 'لا توجد سجلات طبية' : `لا توجد ${activeFilter}`}
              </Text>
              {errorMsg ? (
                <Text style={styles.emptySubtitle}>{errorMsg}</Text>
              ) : (
                <Text style={styles.emptySubtitle}>
                  ستظهر هنا وصفاتك وتقاريرك الطبية بعد زيارة الطبيب
                </Text>
              )}
              {errorMsg && (
                <TouchableOpacity style={styles.retryBtn} onPress={fetchRecords}>
                  <Text style={styles.retryText}>إعادة المحاولة</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },

  // Filters
  filtersWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 10,
  },
  filtersInner: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: 'transparent',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  countBadge: {
    marginRight: 12,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countText: { fontFamily: 'Cairo-Bold', fontSize: 13, color: colors.primary },

  // List
  list: { padding: 16, gap: 16, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typeLabel: { fontFamily: 'Cairo-Bold', fontSize: 14 },
  dateText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  feeBadge: {
    backgroundColor: '#10B98115',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  feeText: { fontFamily: 'Cairo-Bold', fontSize: 13, color: '#10B981' },

  // Clinic row
  clinicRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clinicName: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textMain },
  specialtyText: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary },

  divider: { height: 1, backgroundColor: colors.borderLight },

  // Section
  section: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 13, color: colors.primary },
  sectionBody: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 22, textAlign: 'right' },

  // AI
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF615',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiLabel: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: '#8B5CF6' },

  // Actions
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { fontFamily: 'Cairo-Bold', fontSize: 13, color: '#fff' },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, textAlign: 'center' },
  emptySubtitle: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { fontFamily: 'Cairo-Bold', fontSize: 14, color: '#fff' },
});
