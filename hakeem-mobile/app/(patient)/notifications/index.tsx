import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, NotificationItem, EmptyState } from '../../../src/components/common';
import { colors } from '../../../src/theme/colors';

// Mock data until API is ready
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'موعد مؤكد',
    message: 'تم تأكيد موعدك مع د. أحمد محمد غداً الساعة 10:00 صباحاً.',
    time: 'منذ ساعتين',
    isRead: false,
    type: 'success' as const,
  },
  {
    id: '2',
    title: 'تذكير بموعد',
    message: 'لا تنسَ موعدك اليوم في عيادة الابتسامة لطب الأسنان.',
    time: 'منذ 5 ساعات',
    isRead: false,
    type: 'info' as const,
  },
  {
    id: '3',
    title: 'إلغاء موعد',
    message: 'نعتذر، تم إلغاء موعدك من قبل الطبيب لظروف طارئة.',
    time: 'الأمس',
    isRead: true,
    type: 'error' as const,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (id: string) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="الإشعارات"
        showBack
        rightComponent={
          notifications.some(n => !n.isRead) ? (
            <View style={styles.markReadBtn} onTouchEnd={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done" size={24} color={colors.primary} />
            </View>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            {...item}
            onPress={() => handleNotificationPress(item.id)}
          />
        )}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="لا توجد إشعارات"
            subtitle="ليس لديك أي إشعارات جديدة في الوقت الحالي."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  markReadBtn: {
    padding: 8,
  },
});
