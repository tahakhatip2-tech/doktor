import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, ChatBubble } from '../../../src/components/common';
import { colors } from '../../../src/theme/colors';
import { apiClient } from '../../../src/api/client';

export default function ChatRoomScreen() {
  const { id, isClinic } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initChat();
  }, [id, isClinic]);

  const initChat = async () => {
    try {
      setIsLoading(true);
      let convId = null;
      if (isClinic === 'true') {
        const res = await apiClient.get(`/patient/chat/clinics/${id}`);
        convId = res.data?.id;
        setClinicData(res.data?.clinic);
      } else {
        convId = Number(id);
      }
      
      if (convId) {
        setConversationId(convId);
        await fetchMessages(convId);
      }
    } catch (err) {
      console.log('Error init chat:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = useCallback(async (convId: number) => {
    try {
      const res = await apiClient.get(`/patient/chat/conversations/${convId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setMessages(data);
      setTimeout(() => {
        if (data.length > 0) flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (err) {
      setMessages([]);
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId || isSending) return;

    try {
      setIsSending(true);
      await apiClient.post(`/patient/chat/conversations/${conversationId}/messages`, {
        content: inputText.trim(),
      });
      setInputText('');
      await fetchMessages(conversationId);
    } catch (err) {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  // set interval for auto refresh
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => fetchMessages(conversationId), 10000);
    return () => clearInterval(interval);
  }, [conversationId, fetchMessages]);

  const CustomHeaderTitle = () => (
    <View style={styles.headerTitleContainer}>
      <View style={[styles.headerAvatar, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="medical" size={20} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.headerTitle}>{clinicData?.name || 'العيادة'}</Text>
        <Text style={styles.headerSubtitle}>محادثة طبية</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title=""
        showBack
        rightComponent={<CustomHeaderTitle />}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isPatient = item.senderType === 'PATIENT';
              return (
                <ChatBubble
                  message={item.content}
                  time={new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  isOwnMessage={isPatient}
                  isRead={item.isRead}
                />
              );
            }}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
                 <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted || '#94a3b8'} />
                 <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginTop: 10 }}>لا توجد رسائل بعد</Text>
                 <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary }}>ابدأ المحادثة مع العيادة</Text>
              </View>
            }
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="#94a3b8" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="اكتب رسالة..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              textAlign="right"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#ffffff" style={styles.sendIcon} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Cairo-Bold',
    color: '#ffffff',
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#e2e8f0',
    textAlign: 'left',
  },
  keyboardAvoid: {
    flex: 1,
  },
  list: {
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  attachButton: {
    padding: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    minHeight: 44,
    fontFamily: 'Cairo-Regular',
    fontSize: 15,
    color: '#334155',
    marginHorizontal: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendIcon: {
    marginRight: 4, // center visually due to icon shape
  },
});
