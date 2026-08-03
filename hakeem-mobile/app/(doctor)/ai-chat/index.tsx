import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { AppHeader } from '../../../src/components/common';
import { apiClient } from '../../../src/api/client';

interface ChatMessage {
    role: 'doctor' | 'assistant';
    content: string;
    timestamp: string;
}

export default function DoctorAIChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await apiClient.get('/whatsapp/doctor-chat/history');
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const clearHistory = async () => {
        Alert.alert(
            "تأكيد",
            "هل أنت متأكد من مسح المحادثة؟",
            [
                { text: "إلغاء", style: "cancel" },
                { 
                    text: "مسح", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiClient.delete('/whatsapp/doctor-chat/history');
                            setMessages([]);
                        } catch (error) {
                            Alert.alert('خطأ', 'فشل مسح المحادثة');
                        }
                    } 
                }
            ]
        );
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const newMsg: ChatMessage = { role: 'doctor', content: text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await apiClient.post('/whatsapp/doctor-command', { message: text });
            if (res.data.success) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: res.data.response, 
                    timestamp: new Date().toISOString() 
                }]);
            }
        } catch (error) {
            Alert.alert('خطأ', 'فشل الاتصال بالخادم');
        } finally {
            setLoading(false);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
        sendMessage(action);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AppHeader 
                title="الموظف الذكي" 
                showBack={true}
            />

            <KeyboardAvoidingView 
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollContent}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={styles.botIconWrapper}>
                                <Ionicons name="logo-android" size={40} color={colors.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>مرحباً يا دكتور</Text>
                            <Text style={styles.emptySub}>أنا الموظف الذكي، جاهز لتنفيذ أوامرك.</Text>
                        </View>
                    )}

                    {messages.map((msg, idx) => (
                        <View 
                            key={idx} 
                            style={[
                                styles.messageRow,
                                msg.role === 'doctor' ? styles.messageRowDoctor : styles.messageRowBot
                            ]}
                        >
                            <View style={[
                                styles.messageBubble,
                                msg.role === 'doctor' ? styles.messageBubbleDoctor : styles.messageBubbleBot
                            ]}>
                                <Text style={[
                                    styles.messageText,
                                    msg.role === 'doctor' ? styles.messageTextDoctor : styles.messageTextBot
                                ]}>
                                    {msg.content}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {loading && (
                        <View style={[styles.messageRow, styles.messageRowBot]}>
                            <View style={[styles.messageBubble, styles.messageBubbleBot, styles.loadingBubble]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.loadingText}>يعالج الأمر...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputArea}>
                    <View style={styles.quickActions}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickAction('أعطني مواعيد اليوم')}>
                                <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                                <Text style={styles.quickBtnText}>مواعيد اليوم</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickAction('أعطني مواعيد غداً')}>
                                <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                                <Text style={styles.quickBtnText}>مواعيد غداً</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.quickBtn} onPress={() => handleQuickAction('أضف موعد غداً الساعة 10:00 باسم أحمد')}>
                                <Ionicons name="add-circle-outline" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                                <Text style={styles.quickBtnText}>إضافة موعد</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity 
                            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} 
                            onPress={() => sendMessage(input)}
                            disabled={!input.trim() || loading}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="اكتب أمرك هنا..."
                            placeholderTextColor={colors.textMuted}
                            value={input}
                            onChangeText={setInput}
                            multiline
                            textAlign="right"
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardAvoid: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 20 },
    
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    botIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 8 },
    emptySub: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary },

    messageRow: { flexDirection: 'row', marginBottom: 12, width: '100%' },
    messageRowDoctor: { justifyContent: 'flex-start' },
    messageRowBot: { justifyContent: 'flex-end' },

    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
    messageBubbleDoctor: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
    messageBubbleBot: { backgroundColor: colors.card, borderTopLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    
    messageText: { fontFamily: 'Cairo-Regular', fontSize: 14, writingDirection: 'rtl' },
    messageTextDoctor: { color: 'white' },
    messageTextBot: { color: colors.textMain },

    loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    loadingText: { fontFamily: 'Cairo-Medium', fontSize: 13, color: colors.primary },

    inputArea: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
    
    quickActions: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    quickBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: `${colors.primary}10`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: `${colors.primary}20` },
    quickBtnText: { fontFamily: 'Cairo-SemiBold', fontSize: 12, color: colors.primary },

    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, gap: 12 },
    input: { flex: 1, backgroundColor: colors.background, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 45, maxHeight: 100, fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textMain },
    sendBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    sendBtnDisabled: { backgroundColor: colors.border, shadowOpacity: 0 },
});
