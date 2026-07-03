import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { ScreenHeader, EmptyState } from '../../../src/components/common';

const MOCK_CHATS = [
  { id: 1, clinicId: 1, clinicName: 'عيادة د. أحمد للأسنان', lastMessage: 'نعم، يمكنك الحضور غداً في نفس الموعد.', time: '10:30 ص', unread: 2 },
  { id: 2, clinicId: 2, clinicName: 'مستشفى الشفاء - قسم الجلدية', lastMessage: 'شكراً لك.', time: 'أمس', unread: 0 },
];

export default function ChatListScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof MOCK_CHATS[0] }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => router.push(`/(patient)/chat/${item.clinicId}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarGlow} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.clinicName.charAt(0)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{item.clinicName}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.message, item.unread > 0 && styles.messageUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="المحادثات" showBack={false} />
      
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="لا توجد محادثات"
            subtitle="لم تقم ببدء أي محادثة مع العيادات أو الصيدليات بعد."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20, gap: 16 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    opacity: 0.3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: `${colors.primary}40`,
    zIndex: 1,
  },
  avatarText: { fontFamily: 'Cairo-Bold', fontSize: 20, color: colors.primaryLight },
  content: { flex: 1, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  time: { fontFamily: 'Cairo-SemiBold', fontSize: 11, color: colors.textSecondary },
  message: { flex: 1, fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },
  messageUnread: { fontFamily: 'Cairo-SemiBold', color: colors.textMain },
  badge: {
    backgroundColor: colors.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: { fontFamily: 'Cairo-Bold', fontSize: 11, color: colors.white },
});
