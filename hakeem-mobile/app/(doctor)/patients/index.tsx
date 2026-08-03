import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { Card, Input, AppHeader, EmptyState, Skeleton, useToast, Toast, PageHero } from '../../../src/components/common';
import { contactsApi } from '../../../src/api/modules.api';
import { getErrorMessage } from '../../../src/api/client';

export default function DoctorPatientsScreen() {
  const router = useRouter();
  const { toast, show, hide } = useToast();
  
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 400);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await contactsApi.getAll({ search: debouncedSearch });
      setPatients(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      show(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [fetchPatients])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push(`/(doctor)/patients/${item.id}` as any)}
    >
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{item.name?.charAt(0) || '🧑'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name || 'مريض غير مسجل'}</Text>
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
          </View>
          <View style={styles.iconBtn}>
            <Ionicons name="folder-open-outline" size={20} color={colors.primary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="مرضى العيادة" showBack={false} />
      <PageHero
        title="سجلات المرضى"
        subtitle="قاعدة بيانات المرضى والتاريخ الطبي"
        icon="people-outline"
        iconColor="#06b6d4"
        showClock={false}
      />
      
      <View style={styles.header}>
        <Input 
          value={search}
          onChangeText={handleSearchChange}
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
          style={{ marginBottom: 0 }}
        />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.listContainer}>
          {[1,2,3,4].map(i => (
             <Card key={i} style={styles.card}>
                <View style={styles.cardRow}>
                  <Skeleton width={60} height={60} borderRadius={30} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} />
                  </View>
                  <Skeleton width={40} height={40} borderRadius={12} />
                </View>
             </Card>
          ))}
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="لا يوجد مرضى"
              subtitle={search ? "لا يوجد مرضى مطابقين للبحث" : "لم تقم بتسجيل أي مريض بعد"}
            />
          }
        />
      )}
      
      <Toast {...toast} onHide={hide} />
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
  listContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.info}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 24,
    color: colors.info,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
    textAlign: 'left',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  phone: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
