import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal as RNModal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { apiClient } from '../../../src/api/client';
import { AppHeader, Toast, useToast } from '../../../src/components/common';

interface Template {
  id: number;
  name: string;
  content: string;
  category?: string;
  usageCount?: number;
  createdAt: string;
}

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const { toast, show, hide } = useToast();

  const [form, setForm] = useState({ name: '', content: '', category: '' });

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/templates');
      setTemplates(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchTemplates(); }, [fetchTemplates]));

  const openAddModal = () => {
    setEditing(null);
    setForm({ name: '', content: '', category: '' });
    setShowModal(true);
  };

  const openEditModal = (t: Template) => {
    setEditing(t);
    setForm({ name: t.name, content: t.content, category: t.category || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      show('الاسم والمحتوى مطلوبان', 'warning');
      return;
    }
    try {
      if (editing) {
        await apiClient.put(`/templates/${editing.id}`, form);
        show('تم التعديل بنجاح', 'success');
      } else {
        await apiClient.post('/templates', form);
        show('تم الإضافة بنجاح', 'success');
      }
      setShowModal(false);
      fetchTemplates();
    } catch {
      show('حدث خطأ', 'error');
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('حذف النموذج', `هل تريد حذف "${name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/templates/${id}`);
            show('تم الحذف', 'success');
            fetchTemplates();
          } catch {
            show('خطأ في الحذف', 'error');
          }
        },
      },
    ]);
  };

  const categoryColors: Record<string, string> = {
    greeting: colors.success,
    reminder: colors.warning,
    prescription: colors.primary,
    follow_up: colors.info,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="نماذج الرسائل" showBack={false} />

      <View style={styles.topBar}>
        <Text style={styles.countText}>{templates.length} نموذج</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>نموذج جديد</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={60} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد نماذج</Text>
          <Text style={styles.emptySub}>أنشئ نموذج رسالة سريع يمكن إرساله للمرضى</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name="document-text" size={22} color={categoryColors[item.category || ''] || colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.category && (
                    <Text style={[styles.categoryBadge, { color: categoryColors[item.category] || colors.textMuted }]}>
                      {item.category}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name)}>
                  <Ionicons name="trash" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
              {item.usageCount != null && item.usageCount > 0 && (
                <Text style={styles.usageText}>استُخدم {item.usageCount} مرة</Text>
              )}
            </View>
          )}
        />
      )}

      {/* Modal */}
      <RNModal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'تعديل النموذج' : 'نموذج جديد'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={styles.label}>اسم النموذج *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(v) => setForm(p => ({ ...p, name: v }))}
                    placeholder="مثال: رسالة ترحيب"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View>
                  <Text style={styles.label}>التصنيف</Text>
                  <TextInput
                    style={styles.input}
                    value={form.category}
                    onChangeText={(v) => setForm(p => ({ ...p, category: v }))}
                    placeholder="greeting, reminder, prescription..."
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View>
                  <Text style={styles.label}>محتوى الرسالة *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={form.content}
                    onChangeText={(v) => setForm(p => ({ ...p, content: v }))}
                    placeholder="اكتب نص الرسالة هنا... يمكنك استخدام {{name}} لاسم المريض"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={6}
                  />
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>{editing ? 'حفظ التعديلات' : 'إضافة النموذج'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </RNModal>

      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  emptySub: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  countText: { fontFamily: 'Cairo-SemiBold', fontSize: 14, color: colors.textSecondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  addBtnText: { fontFamily: 'Cairo-Bold', fontSize: 14, color: '#fff' },

  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface, borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4, gap: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 15, color: colors.textMain },
  categoryBadge: { fontFamily: 'Cairo-Regular', fontSize: 12 },
  cardContent: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  usageText: { fontFamily: 'Cairo-Regular', fontSize: 11, color: colors.textMuted },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: `${colors.error}15`, justifyContent: 'center', alignItems: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  label: { fontFamily: 'Cairo-SemiBold', fontSize: 13, color: colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 14, borderWidth: 1,
    borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textMain, textAlign: 'right',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: 16,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  submitBtnText: { fontFamily: 'Cairo-Bold', fontSize: 16, color: '#fff' },
});
