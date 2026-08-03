import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Input, Card, Badge, AppHeader, EmptyState, ClinicSkeleton } from '../../../src/components/common';
import { clinicsApi } from '../../../src/api/modules.api';
import { Clinic } from '../../../src/types/clinic.types';

const SPECIALTIES = [
  'الكل',
  'طب عام',
  'أسنان',
  'أطفال',
  'باطنية',
  'جلدية',
  'عيون',
  'عظام',
];

export default function ClinicsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'CLINICS' | 'PHARMACIES'>('CLINICS');
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('الكل');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClinics = useCallback(async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'CLINICS') {
        const res = await clinicsApi.getAll({ 
          search, 
          specialty: activeSpecialty === 'الكل' ? undefined : activeSpecialty 
        });
        setClinics(res.data);
      } else {
        const res = await clinicsApi.getPharmacies({ search });
        // The API returns users with role PHARMACY, map them to standard clinic type
        setClinics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [search, activeSpecialty, activeTab]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchClinics();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeSpecialty, fetchClinics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClinics();
  };

  const renderClinic = ({ item }: { item: Clinic }) => (
    <TouchableOpacity onPress={() => router.push(`/(patient)/clinics/${item.id}`)} activeOpacity={0.85}>
      <Card style={styles.clinicCard}>
        <View style={styles.cardHeader}>
          <View style={styles.logoWrapper}>
             <Text style={styles.logoEmoji}>{item.metadata?.icon || '🏥'}</Text>
          </View>
          <View style={styles.headerInfo}>
             <Text style={styles.clinicName} numberOfLines={1}>{item.name}</Text>
             <Text style={styles.specialty}>{item.metadata?.specialty || 'تخصص عام'}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.metadata?.rating || '4.5'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.footerText} numberOfLines={1}>
              {item.address || 'العنوان غير محدد'}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.footerText}>
              {item.status === 'active' ? 'مفتوح الآن' : 'مغلق'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="العيادات الطبية" showBack />
      
      <View style={styles.searchSection}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'CLINICS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('CLINICS')}
            activeOpacity={0.8}
          >
            <Ionicons name="medical" size={16} color={activeTab === 'CLINICS' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'CLINICS' && styles.tabTextActive]}>العيادات</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'PHARMACIES' && styles.tabButtonActive]}
            onPress={() => setActiveTab('PHARMACIES')}
            activeOpacity={0.8}
          >
            <Ionicons name="flask" size={16} color={activeTab === 'PHARMACIES' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'PHARMACIES' && styles.tabTextActive]}>الصيدليات</Text>
          </TouchableOpacity>
        </View>

        <Input 
          value={search}
          onChangeText={setSearch}
          placeholder={activeTab === 'CLINICS' ? "ابحث عن عيادة أو طبيب..." : "ابحث عن صيدلية..."}
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          style={styles.searchInput}
        />

        {activeTab === 'CLINICS' && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SPECIALTIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeSpecialty === item && styles.filterChipActive
                ]}
                onPress={() => setActiveSpecialty(item)}
              >
                <Text style={[
                  styles.filterText,
                  activeSpecialty === item && styles.filterTextActive
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filtersContainer}
          />
        )}
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.listContainer}>
          <ClinicSkeleton />
          <ClinicSkeleton />
          <ClinicSkeleton />
        </View>
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClinic}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="لا توجد عيادات مطابقة"
              subtitle="جرب البحث بكلمات أخرى أو تغيير التخصص"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    padding: 4,
    borderRadius: 14,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  filtersContainer: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
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
    gap: 16,
    paddingBottom: 40,
  },
  clinicCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  clinicName: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
    textAlign: 'left',
  },
  specialty: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.primary,
    textAlign: 'left',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    color: '#F59E0B',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'left',
  },
});
