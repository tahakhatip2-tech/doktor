import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../../src/theme/colors';
import { AppHeader, EmptyState, Skeleton, useToast, Toast } from '../../../src/components/common';
import { notificationsApi } from '../../../src/api/modules.api';

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast, show: showToast, hide: hideToast } = useToast();
  
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['patient-notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data)
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-notifications-home'] });
      queryClient.invalidateQueries({ queryKey: ['patient-unread-count'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['patient-notifications-home'] });
      queryClient.invalidateQueries({ queryKey: ['patient-unread-count'] });
      showToast('تم تحديد الكل كمقروء', 'success');
    }
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = (notif: any) => {
    if (!notif.isRead) {
      markAsReadMutation.mutate(notif.id);
    }
    
    // التوجيه بناءً على نوع الإشعار (مثلاً appointment)
    if (notif.type === 'appointment_status' || notif.type === 'appointment_reminder') {
      // توجيه لصفحة المواعيد
      router.push('/(patient)/appointments');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUnread = !item.isRead;
    
    // اختيار الأيقونة واللون بناءً على نوع الإشعار
    let iconName = 'notifications-outline' as any;
    let iconColor: string = colors.primary;
    let bgColor: string = `${colors.primary}15`;

    if (item.type?.includes('appointment')) {
      iconName = 'calendar-outline';
      iconColor = colors.accent;
      bgColor = `${colors.accent}15`;
    } else if (item.type?.includes('prescription')) {
      iconName = 'flask-outline';
      iconColor = colors.success;
      bgColor = `${colors.success}15`;
    } else if (item.type?.includes('offer')) {
      iconName = 'gift-outline';
      iconColor = '#8B5CF6';
      bgColor = '#8B5CF615';
    }

    return (
      <TouchableOpacity 
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.timeText}>منذ قليل</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader 
        title="الإشعارات" 
        showBack 
        rightComponent={
          notifications?.some((n: any) => !n.isRead) ? (
            <TouchableOpacity onPress={() => markAllAsReadMutation.mutate()}>
              <Text style={styles.markAllText}>تحديد كـ مقروء</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isLoading && !refreshing ? (
        <View style={styles.listContainer}>
          {[1,2,3,4].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton width={50} height={50} borderRadius={25} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="80%" height={16} />
                <Skeleton width="100%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="لا توجد إشعارات"
              subtitle="ليس لديك أي إشعارات جديدة حالياً."
            />
          }
        />
      )}
      
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  markAllText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
  listContainer: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: `${colors.primary}40`,
    backgroundColor: `${colors.primary}05`,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Cairo-SemiBold',
    fontSize: 15,
    color: colors.textMain,
  },
  titleUnread: {
    fontFamily: 'Cairo-Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  message: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timeText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
