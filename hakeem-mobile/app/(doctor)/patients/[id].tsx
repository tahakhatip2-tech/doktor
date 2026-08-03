import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { AppHeader, Card, Button } from '../../../src/components/common';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../src/api/client';
import { Skeleton } from '../../../src/components/common';
import moment from 'moment';

export default function DoctorPatientRecordScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  const { data: patient, isLoading } = useQuery({
    queryKey: ['doctor-patient', id],
    queryFn: () => apiClient.get(`/contacts/${id}`).then(res => res.data),
    enabled: !!id,
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case 'prescription': return { name: 'flask', color: colors.success, bg: `${colors.success}15` };
      case 'diagnosis': return { name: 'medical', color: colors.info, bg: `${colors.info}15` };
      default: return { name: 'calendar', color: colors.primary, bg: `${colors.primary}15` };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader title="السجل الطبي للمريض" showBack />
        <View style={{ padding: 20 }}>
           <Skeleton width={80} height={80} borderRadius={40} style={{ alignSelf: 'center', marginBottom: 12 }} />
           <Skeleton width={150} height={20} style={{ alignSelf: 'center', marginBottom: 8 }} />
           <Skeleton width={100} height={16} style={{ alignSelf: 'center', marginBottom: 20 }} />
           <Skeleton width="100%" height={200} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader title="السجل الطبي للمريض" showBack />
        <View style={{ padding: 20, alignItems: 'center', marginTop: 100 }}>
          <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textSecondary }}>المريض غير موجود</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Flatten history (appointments and medical records)
  const history: any[] = [];
  if (patient.appointment) {
    patient.appointment.forEach((appt: any) => {
      history.push({
        id: `appt-${appt.id}`,
        date: appt.appointmentDate,
        type: 'appointment',
        title: 'زيارة عيادة',
        details: appt.notes || 'موعد كشفية'
      });
      if (appt.medicalRecords) {
        appt.medicalRecords.forEach((rec: any) => {
          history.push({
            id: `rec-${rec.id}`,
            date: rec.createdAt,
            type: rec.type === 'prescription' ? 'prescription' : 'diagnosis',
            title: rec.type === 'prescription' ? 'وصفة طبية' : 'تشخيص',
            details: rec.details || rec.description || 'لا يوجد تفاصيل'
          });
        });
      }
    });
  }
  
  if (patient.medicalRecords) {
     patient.medicalRecords.forEach((rec: any) => {
          history.push({
            id: `rec-dir-${rec.id}`,
            date: rec.createdAt,
            type: rec.type === 'prescription' ? 'prescription' : 'diagnosis',
            title: rec.type === 'prescription' ? 'وصفة طبية' : 'تشخيص',
            details: rec.details || rec.description || 'لا يوجد تفاصيل'
          });
      });
  }

  // Sort history by date desc
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="السجل الطبي للمريض" showBack />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Patient Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>🧑</Text>
          </View>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.phone}>{patient.phone}</Text>
          
          <View style={styles.quickTags}>
            {patient.ageRange && <View style={styles.tag}><Text style={styles.tagText}>{patient.ageRange}</Text></View>}
            {patient.bloodType && <View style={styles.tag}><Text style={styles.tagText}>{patient.bloodType}</Text></View>}
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
                <Text style={styles.infoValue}>PT-{patient.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الرقم الوطني</Text>
                <Text style={styles.infoValue}>{patient.nationalId || 'غير متوفر'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>تاريخ التسجيل</Text>
                <Text style={styles.infoValue}>{moment(patient.createdAt).format('LL')}</Text>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>الأمراض المزمنة والحساسية</Text>
              
              {(!patient.allergies && !patient.chronicDiseases) ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>لا توجد بيانات مسجلة.</Text>
                  </View>
              ) : (
                  <View style={{ gap: 8 }}>
                     {patient.allergies && <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.error }}>الحساسية: {patient.allergies}</Text>}
                     {patient.chronicDiseases && <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.warning }}>الأمراض المزمنة: {patient.chronicDiseases}</Text>}
                  </View>
              )}
            </Card>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {history.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>لا يوجد تاريخ طبي مسجل</Text>
                </View>
            ) : (
                history.map(item => {
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
                        <Text style={styles.historyDate}>{moment(item.date).format('ll')}</Text>
                    </View>
                    <Text style={styles.historyDetails}>{item.details}</Text>
                    </Card>
                );
                })
            )}
            
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
