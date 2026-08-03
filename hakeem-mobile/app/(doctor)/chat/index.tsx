import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { apiClient } from '../../../src/api/client';
import { AppHeader } from '../../../src/components/common';

interface Conversation {
  id: number;
  patient: { id: number; fullName: string; phone?: string; avatar?: string };
  messages: Message[];
  unreadDoctorCount?: number;
  updatedAt: string;
  patientId: number;
}

interface Message {
  id: number;
  content: string;
  senderType: 'DOCTOR' | 'PATIENT' | 'BOT';
  createdAt: string;
}

export default function DoctorChatScreen() {
  const router = useRouter();
  const { patientId: paramPatientId, patientName: paramPatientName } = useLocalSearchParams<{ patientId?: string; patientName?: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: selectedConv ? { display: 'none' } : undefined,
    });
  }, [selectedConv, navigation]);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/internal-chat/conversations');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: number) => {
    try {
      const res = await apiClient.get(`/internal-chat/conversations/${convId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setMessages(data);
      setTimeout(() => {
        if (data.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }, 200);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  // إذا جاء patientId من تفاصيل الموعد، افتح المحادثة مباشرة
  useEffect(() => {
    if (!paramPatientId || conversations.length === 0) return;
    const existing = conversations.find(
      c => c.patientId === Number(paramPatientId) || c.patient?.id === Number(paramPatientId)
    );
    if (existing) {
      setSelectedConv(existing);
    } else {
      // إنشاء محادثة جديدة
      apiClient.post('/internal-chat/conversations', { patientId: Number(paramPatientId) })
        .then(res => setSelectedConv(res.data))
        .catch(() => {});
    }
  }, [paramPatientId, conversations]);

  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv.id);
    const interval = setInterval(() => fetchMessages(selectedConv.id), 10000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConv || isSending) return;
    try {
      setIsSending(true);
      await apiClient.post(`/internal-chat/conversations/${selectedConv.id}/messages`, {
        content: messageText.trim(),
      });
      setMessageText('');
      await fetchMessages(selectedConv.id);
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  // ── شاشة المحادثة الواحدة ──
  if (selectedConv) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedConv(null)}>
            <Ionicons name="arrow-forward" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View style={styles.chatHeaderAvatar}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{selectedConv.patient?.fullName || (paramPatientName ? decodeURIComponent(paramPatientName) : 'مريض')}</Text>
            <Text style={styles.chatHeaderSub}>مريض • متصل</Text>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyMessagesText}>لا توجد رسائل بعد</Text>
                <Text style={styles.emptyMessagesSub}>ابدأ المحادثة مع المريض</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isDoctor = item.senderType === 'DOCTOR' || item.senderType === 'BOT';
              return (
                <View style={[styles.messageBubble, isDoctor ? styles.messageSent : styles.messageReceived]}>
                  <Text style={[styles.messageText, isDoctor ? styles.messageSentText : styles.messageReceivedText]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.messageTime, { color: isDoctor ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
                    {new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }}
          />

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.sendBtn, { opacity: messageText.trim() ? 1 : 0.5 }]}
              onPress={sendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={20} color="#fff" />}
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="اكتب رسالتك..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }


  // ── قائمة المحادثات ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="رسائل المرضى" showBack={false} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubbles-outline" size={60} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد محادثات</Text>
          <Text style={styles.emptySubtitle}>ستظهر هنا محادثات المرضى معك</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convCard}
              onPress={() => setSelectedConv(item)}
              activeOpacity={0.8}
            >
              <View style={styles.convAvatar}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.convName}>{item.patient?.fullName || 'مريض'}</Text>
                <Text style={styles.convLastMsg} numberOfLines={1}>{item.messages?.[0]?.content || 'ابدأ المحادثة...'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.convTime}>
                  {new Date(item.updatedAt).toLocaleDateString('ar-SA')}
                </Text>
                {(item.unreadDoctorCount ?? 0) > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{(item.unreadDoctorCount ?? 0) > 9 ? '9+' : item.unreadDoctorCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  emptySubtitle: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },

  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  convAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: `${colors.primary}40`,
  },
  convName: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain, marginBottom: 2 },
  convLastMsg: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary },
  convTime: { fontFamily: 'Cairo-Regular', fontSize: 11, color: colors.textMuted },
  unreadBadge: {
    backgroundColor: colors.error, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: { fontFamily: 'Cairo-Bold', fontSize: 10, color: '#fff' },

  // Chat Screen
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center', alignItems: 'center',
  },
  chatHeaderInfo: { flex: 1 },
  chatHeaderName: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain },
  chatHeaderSub: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.primary },
  chatHeaderAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center', alignItems: 'center',
  },
  messagesList: { padding: 16, gap: 10, flexGrow: 1 },
  messagesEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyMessages: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60 },
  emptyMessagesText: { fontFamily: 'Cairo-Bold', fontSize: 17, color: colors.textMain },
  emptyMessagesSub: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  messageSent: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageReceived: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontFamily: 'Cairo-Regular', fontSize: 14, lineHeight: 22 },
  messageSentText: { color: '#fff' },
  messageReceivedText: { color: colors.textMain },
  messageTime: { fontFamily: 'Cairo-Regular', fontSize: 10, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textMain,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
