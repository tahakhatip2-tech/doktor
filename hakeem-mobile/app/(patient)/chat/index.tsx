import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenHeader, EmptyState } from '../../../src/components/common';
import { colors } from '../../../src/theme/colors';
import { apiClient } from '../../../src/api/client';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const res = await apiClient.get('/patient/chat/conversations');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setChats(data);
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const renderChatItem = ({ item }: { item: any }) => {
    const lastMsg = item.messages?.[0];
    const unreadCount = item.unreadPatientCount || 0;
    const timeString = lastMsg 
      ? new Date(lastMsg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) 
      : '';
      
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/(patient)/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
           <Text style={{ fontSize: 24, textAlign: 'center', lineHeight: 56 }}>🏥</Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.clinicName} numberOfLines={1}>
              {item.clinic?.name || 'العيادة'}
            </Text>
            <Text style={[styles.time, unreadCount > 0 && styles.unreadTime]}>
              {timeString}
            </Text>
          </View>
          <Text style={styles.doctorName} numberOfLines={1}>
            د. {item.clinic?.doctorName || 'طبيب'}
          </Text>
          <View style={styles.lastMessageRow}>
            <Text
              style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]}
              numberOfLines={1}
            >
              {lastMsg?.content || 'لا توجد رسائل'}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="المحادثات" showBack />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <EmptyState 
              icon="chatbubbles-outline"
              title="لا توجد محادثات"
              subtitle="لم تقم ببدء أي محادثة مع طبيب حتى الآن."
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
    backgroundColor: '#f8fafc',
  },
  list: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e2e8f0',
    marginLeft: 12, // RTL
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  clinicName: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#334155',
    flex: 1,
    textAlign: 'left',
  },
  doctorName: {
    fontSize: 13,
    fontFamily: 'Cairo-Medium',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'left',
  },
  time: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#94a3b8',
    marginLeft: 8,
  },
  unreadTime: {
    color: colors.primary,
    fontFamily: 'Cairo-Bold',
  },
  lastMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#64748b',
    flex: 1,
    textAlign: 'left',
  },
  unreadMessage: {
    color: '#0f172a',
    fontFamily: 'Cairo-SemiBold',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
  },
});
