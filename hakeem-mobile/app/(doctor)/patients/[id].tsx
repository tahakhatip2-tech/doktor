import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { AppHeader, Card, Button } from '../../../src/components/common';

const MOCK_PATIENT = {
  id: 1,
  name: 'أحمد محمود',
  phone: '0791234567',
  age: '28 سنة',
  bloodType: 'O+',
  insurance: 'التعاونية',
};

const MOCK_HISTORY = [
  { id: 1, date: '2023-10-15', type: 'prescription', title: 'وصفة طبية - التهاب قصبات', details: 'أموكسيسيلين 500 ملغ كل 8 ساعات.' },
  { id: 2, date: '2023-08-22', type: 'diagnosis', title: 'تشخيص - مراجعة دورية', details: 'الضغط طبيعي، تم التوصية بممارسة الرياضة.' },
  { id: 3, date: '2023-05-10', type: 'appointment', title: 'زيارة عيادة', details: 'موعد استشارة عامة.' },
];

export default function DoctorPatientRecordScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  const renderIcon = (type: string) => {
    switch (type) {
      case 'prescription': return { name: 'flask', color: colors.success, bg: `${colors.success}15` };
      case 'diagnosis': return { name: 'medical', color: colors.info, bg: `${colors.info}15` };
      default: return { name: 'calendar', color: colors.primary, bg: `${colors.primary}15` };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="السجل الطبي للمريض" showBack />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Patient Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>🧑</Text>
          </View>
          <Text style={styles.name}>{MOCK_PATIENT.name}</Text>
          <Text style={styles.phone}>{MOCK_PATIENT.phone}</Text>
          
          <View style={styles.quickTags}>
            <View style={styles.tag}><Text style={styles.tagText}>{MOCK_PATIENT.age}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{MOCK_PATIENT.bloodType}</Text></View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>المعلومات الأساسية</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>التاريخ الطبي</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'info' ? (
          <View style={{ gap: 16 }}>
            <Card style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>رقم الملف</Text>
                <Text style={styles.infoValue}>PT-{MOCK_PATIENT.id}009</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>شركة التأمين</Text>
                <Text style={styles.infoValue}>{MOCK_PATIENT.insurance}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>تاريخ التسجيل</Text>
                <Text style={styles.infoValue}>12 يناير 2023</Text>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>الأمراض المزمنة والحساسية</Text>
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>لا توجد بيانات مسجلة.</Text>
              </View>
              <Button title="عرض التفاصيل" variant="outline" size="sm" style={{ marginTop: 12 }} onPress={() => {}} />
            </Card>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {MOCK_HISTORY.map(item => {
              const iconConf = renderIcon(item.type);
              return (
                <Card key={item.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTitleRow}>
                      <View style={[styles.iconBox, { backgroundColor: iconConf.bg }]}>
                        <Ionicons name={iconConf.name as any} size={18} color={iconConf.color} />
                      </View>
                      <Text style={styles.historyTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.historyDetails}>{item.details}</Text>
                </Card>
              );
            })}
            
            <Button title="تحميل التقرير" icon={<Ionicons name="download-outline" size={20} color={colors.white} />} onPress={() => {}} />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.info}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36 },
  name: { fontFamily: 'Cairo-Bold', fontSize: 22, color: colors.textMain, marginBottom: 4 },
  phone: { fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.textSecondary, marginBottom: 12 },
  quickTags: { flexDirection: 'row', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.surfaceLight, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  tagText: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textMain },
  tabsContainer: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  card: { padding: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  infoLabel: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  infoValue: { fontFamily: 'Cairo-Bold', fontSize: 14, color: colors.textMain },
  sectionTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 12 },
  emptyBox: { padding: 16, backgroundColor: colors.surfaceLight, borderRadius: 12, alignItems: 'center' },
  emptyText: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  historyCard: { padding: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  historyTitle: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain },
  historyDate: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.textSecondary },
  historyDetails: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 4 },
});
