import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { AppHeader, useToast, Toast } from '../../../src/components/common';
import { chatApi } from '../../../src/api/modules.api';
import { InternalMessage } from '../../../src/types/clinic.types';
import { getErrorMessage } from '../../../src/api/client';
import { useAuthStore } from '../../../src/store/auth.store';
import { getPatientToken } from '../../../src/utils/storage';
import { useChat } from '../../../src/hooks/useChat';

export default function ChatRoomScreen() {
  const { clinicId } = useLocalSearchParams();
  const { toast, show: showToast, hide: hideToast } = useToast();
  const { patientUser } = useAuthStore() as any;

  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // جلب التوكن مرة واحدة
  useEffect(() => {
    getPatientToken().then(setToken);
  }, []);

  // WebSocket — استقبال رسائل جديدة فورياً
  const handleNewMessage = useCallback((msg: InternalMessage) => {
    setMessages(prev => {
      // تجنب التكرار
      if (prev.some(m => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useChat({ clinicId: Number(clinicId), token, onMessage: handleNewMessage });

  // جلب الرسائل الأولية عند فتح الشاشة
  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(Number(clinicId));
      setMessages(res.data || []);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  useFocusEffect(useCallback(() => { fetchMessages(); }, [fetchMessages]));

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const tempId = Date.now();
    const newMsg: InternalMessage = {
      id: tempId,
      conversationId: 0,
      senderType: 'PATIENT',
      senderId: patientUser?.id || 0,
      content: inputText,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    const textToSend = inputText;
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      setIsSending(true);
      const res = await chatApi.sendMessage(Number(clinicId), textToSend);
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
    } catch (err) {
      showToast('لم يتم إرسال الرسالة', 'error');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: InternalMessage }) => {
    const isMe = item.senderType === 'PATIENT';
    const time = new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgClinic]}>
        <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleClinic]}>
          <Text style={[styles.msgText, isMe ? styles.textMe : styles.textClinic]}>{item.content}</Text>
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeClinic]}>{time}</Text>
            {isMe && (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={item.isRead ? colors.info : 'rgba(255,255,255,0.7)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="المحادثة" showBack />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>ابدأ المحادثة الآن</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="اكتب رسالة..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isSending) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isSending}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} style={{ transform: [{ scaleX: -1 }] }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontFamily: 'Cairo-Regular', color: colors.textMuted, marginTop: 12 },
  list: { padding: 16, gap: 12, paddingBottom: 20 },
  msgContainer: { flexDirection: 'row', width: '100%', marginVertical: 4 },
  msgMe: { justifyContent: 'flex-start' },
  msgClinic: { justifyContent: 'flex-end' },
  msgBubble: {
    maxWidth: '80%', padding: 14, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleClinic: {
    backgroundColor: colors.surfaceLight, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  msgText: { fontFamily: 'Cairo-Regular', fontSize: 15, lineHeight: 24 },
  textMe: { color: colors.white },
  textClinic: { color: colors.textMain },
  timeContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 6 },
  timeText: { fontFamily: 'Cairo-SemiBold', fontSize: 10 },
  timeMe: { color: 'rgba(255,255,255,0.7)' },
  timeClinic: { color: colors.textSecondary },
  inputSection: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.borderLight, gap: 12,
  },
  input: {
    flex: 1, minHeight: 52, maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 26, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14,
    fontFamily: 'Cairo-Regular', fontSize: 15, color: colors.textMain,
    textAlign: 'right', borderWidth: 1, borderColor: colors.borderLight,
  },
  sendBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: colors.surfaceLight, shadowOpacity: 0, elevation: 0 },
});
