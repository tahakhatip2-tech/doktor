import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, RefreshControl, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { AppHeader, useToast, Toast } from '../../../src/components/common';
import { medicalRecordsApi } from '../../../src/api/modules.api';
import { getErrorMessage } from '../../../src/api/client';

// Record type config - using vibrant modern colors
const RECORD_TYPES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  prescription: { label: 'وصفة طبية', icon: 'document-text', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  report:       { label: 'تقرير طبي', icon: 'clipboard',      color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  xray:         { label: 'أشعة وتحاليل', icon: 'body',        color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  default:      { label: 'سجل طبي',    icon: 'medkit',        color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
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
      year: 'numeric', month: 'short', day: 'numeric',
    });
    const doctorName  = item.appointment?.user?.name || '—';
    const clinicName  = item.appointment?.user?.clinic_name || '—';
    const specialty   = item.appointment?.user?.clinic_specialty || '';
    const fee         = Number(item.feeAmount) || 0;

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/(patient)/medical-records/${item.id}` as any)}
      >
        {/* ── Header ── */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={18} color={cfg.color} />
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
          {/* Share Action on Header */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => sharePrescription(item)}>
            <Ionicons name="share-social-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Clinic / Doctor (Compressed Info Row) ── */}
        <View style={styles.clinicRow}>
          <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.clinicName} numberOfLines={1}>
            {clinicName} <Text style={styles.specialtyText}>• {doctorName}</Text> {specialty ? <Text style={styles.specialtyText}>({specialty})</Text> : null}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Sections (Compact) ── */}
        {item.diagnosis || item.treatment ? (
           <View style={styles.compactSections}>
              {item.diagnosis ? (
                <View style={styles.section}>
                  <View style={styles.sectionHead}>
                    <Ionicons name="search-outline" size={13} color={colors.primaryLight} />
                    <Text style={[styles.sectionTitle, { color: colors.primaryLight }]}>التشخيص</Text>
                  </View>
                  <Text style={styles.sectionBody} numberOfLines={1}>{item.diagnosis}</Text>
                </View>
              ) : null}

              {item.treatment ? (
                <View style={[styles.section, { backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
                  <View style={styles.sectionHead}>
                    <Ionicons name="flask-outline" size={13} color={colors.success} />
                    <Text style={[styles.sectionTitle, { color: colors.success }]}>العلاج / الدواء</Text>
                  </View>
                  <Text style={styles.sectionBody} numberOfLines={1}>{item.treatment}</Text>
                </View>
              ) : null}
           </View>
        ) : null}

        {/* ── AI Advice badge ── */}
        {item.aiAdvice ? (
          <View style={styles.aiRow}>
            <Ionicons name="sparkles" size={12} color="#A78BFA" />
            <Text style={styles.aiLabel}>نصيحة ذكاء اصطناعي متاحة</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  // ─── Main ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="السجلات والوصفات" showBack />

      {/* Filter chips (Compact) */}
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
          <Ionicons name="document-text-outline" size={42} color={colors.primary} style={{ opacity: 0.5 }} />
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
                size={54}
                color={errorMsg ? colors.error : colors.textMuted}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary },

  // Filters (Compact)
  filtersWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  filtersInner: { paddingHorizontal: 12, gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMid,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primaryGlow },
  chipText: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  countBadge: {
    marginRight: 12,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { fontFamily: 'Cairo-Bold', fontSize: 12, color: colors.primaryLight },

  // List
  list: { padding: 12, gap: 10, paddingBottom: 32 },

  // Card (Compressed)
  card: {
    backgroundColor: colors.surfaceMid,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typeLabel: { fontFamily: 'Cairo-Bold', fontSize: 13 },
  dateText: { fontFamily: 'Cairo-Regular', fontSize: 11, color: colors.textSecondary, marginTop: -2 },
  feeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  feeText: { fontFamily: 'Cairo-Bold', fontSize: 11, color: colors.success },

  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Clinic row (Dense)
  clinicRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  clinicName: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.textMain, flex: 1 },
  specialtyText: { fontFamily: 'Cairo-Regular', fontSize: 11, color: colors.textMuted },

  divider: { height: 1, backgroundColor: colors.borderLight, opacity: 0.5, marginVertical: 2 },

  // Section
  compactSections: { gap: 6 },
  section: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 12, color: colors.primaryLight },
  sectionBody: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textSecondary, textAlign: 'right' },

  // AI
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  aiLabel: { fontFamily: 'Cairo-SemiBold', fontSize: 11, color: '#A78BFA' },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 50, paddingHorizontal: 24, gap: 10 },
  emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, textAlign: 'center' },
  emptySubtitle: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { fontFamily: 'Cairo-Bold', fontSize: 13, color: colors.white },
});
