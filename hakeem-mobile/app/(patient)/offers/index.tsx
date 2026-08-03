import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
  RefreshControl, Modal, KeyboardAvoidingView, Platform,
  TextInput, ScrollView, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { AppHeader, useToast, Toast } from '../../../src/components/common';
import { offersApi } from '../../../src/api/modules.api';
import { Offer } from '../../../src/types/clinic.types';

export default function OffersScreen() {
  const { toast, show: showToast, hide: hideToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Comments state
  const [commentsOffer, setCommentsOffer] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await offersApi.getAll();
      const data = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      setOffers(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'حدث خطأ غير متوقع';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  // ─── Like ──────────────────────────────────────────────────────────────────
  const toggleLike = async (offer: any) => {
    const wasLiked = offer.isLikedByMe;
    setOffers(prev => prev.map(o =>
      o.id === offer.id
        ? { ...o, isLikedByMe: !wasLiked, likesCount: (o.likesCount || 0) + (wasLiked ? -1 : 1) }
        : o
    ));
    try {
      await (wasLiked ? offersApi.unlike(offer.id) : offersApi.like(offer.id));
    } catch {
      setOffers(prev => prev.map(o =>
        o.id === offer.id
          ? { ...o, isLikedByMe: wasLiked, likesCount: (o.likesCount || 0) + (wasLiked ? 1 : -1) }
          : o
      ));
      showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    }
  };

  // ─── Comment ───────────────────────────────────────────────────────────────
  const submitComment = async () => {
    if (!commentText.trim() || !commentsOffer) return;
    setSubmittingComment(true);
    try {
      const res = await offersApi.addComment(commentsOffer.id, commentText.trim());
      const newComment = res.data;
      setOffers(prev => prev.map(o =>
        o.id === commentsOffer.id
          ? { ...o, comments: [...(o as any).comments || [], newComment] }
          : o
      ));
      setCommentsOffer((prev: any) => ({
        ...prev,
        comments: [...(prev?.comments || []), newComment],
      }));
      setCommentText('');
      showToast('تمت إضافة التعليق', 'success');
    } catch {
      showToast('فشل إرسال التعليق', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // ─── Share ─────────────────────────────────────────────────────────────────
  const shareOffer = async (offer: any) => {
    try {
      await Share.share({
        title: offer.title,
        message: `${offer.title}\n\n${offer.content}`,
      });
    } catch {
      showToast('لا يمكن المشاركة حالياً', 'error');
    }
  };

  // ─── Card ──────────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: any }) => {
    const isLiked = item.isLikedByMe;
    const clinicName = item.user?.clinic_name || item.user?.name || 'عيادة';
    const clinicAvatar = item.user?.clinic_logo || item.user?.avatar || 'https://i.pravatar.cc/150';
    const commentsCount = item._count?.comments ?? (item.comments?.length || 0);

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.postHeader}>
          <Image source={{ uri: clinicAvatar }} style={styles.clinicAvatar} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.clinicNameText}>{clinicName}</Text>
            <Text style={styles.postDate}>
              {new Date(item.createdAt).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          <View style={styles.newsBadge}>
            <Text style={styles.newsBadgeText}>أخبار</Text>
          </View>
        </View>

        {/* Image */}
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.content}</Text>

          {item.endDate && (
            <View style={styles.expiryRow}>
              <Ionicons name="time-outline" size={14} color={colors.accent} />
              <Text style={styles.date}>
                صالح حتى {new Date(item.endDate).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        {((item.likesCount || 0) > 0 || commentsCount > 0) && (
          <View style={styles.statsRow}>
            {(item.likesCount || 0) > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="heart" size={14} color={colors.error} />
                <Text style={styles.statText}>{item.likesCount}</Text>
              </View>
            )}
            {commentsCount > 0 && (
              <TouchableOpacity style={styles.statItem} onPress={() => setCommentsOffer(item)}>
                <Text style={styles.statText}>{commentsCount} تعليق</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Actions Bar */}
        <View style={styles.actionsBar}>
          {/* Like */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item)}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.actionText, isLiked && { color: colors.error }]}>
              {isLiked ? 'أعجبني' : 'إعجاب'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.actionDivider} />

          {/* Comment */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setCommentsOffer(item);
              setTimeout(() => inputRef.current?.focus(), 400);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>تعليق</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.actionDivider} />

          {/* Share */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => shareOffer(item)}>
            <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>مشاركة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Comments Modal ─────────────────────────────────────────────────────────
  const renderCommentsModal = () => (
    <Modal
      visible={!!commentsOffer}
      animationType="slide"
      transparent
      onRequestClose={() => setCommentsOffer(null)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheet}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCommentsOffer(null)}>
              <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>التعليقات</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Post summary */}
          {commentsOffer && (
            <View style={styles.postSummary}>
              <Text style={styles.postSummaryTitle} numberOfLines={1}>
                {commentsOffer.title}
              </Text>
            </View>
          )}

          {/* Comments list */}
          <ScrollView style={styles.commentsList} contentContainerStyle={{ padding: 16, gap: 12 }}>
            {(!commentsOffer?.comments || commentsOffer.comments.length === 0) ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
                <Text style={{ fontFamily: 'Cairo-Regular', color: colors.textSecondary, marginTop: 12 }}>
                  لا توجد تعليقات بعد. كن أول من يعلق!
                </Text>
              </View>
            ) : (
              commentsOffer.comments.map((c: any, idx: number) => (
                <View key={c.id || idx} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    {c.user?.avatar ? (
                      <Image source={{ uri: c.user.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                    ) : (
                      <Text style={styles.commentAvatarText}>
                        {(c.user?.name || c.patient?.fullName || '؟').charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>
                      {c.user?.name || c.patient?.fullName || 'مريض'}
                    </Text>
                    <Text style={styles.commentContent}>{c.content}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.commentInputRow}>
            <TouchableOpacity
              style={[styles.sendBtn, (!commentText.trim() || submittingComment) && styles.sendBtnDisabled]}
              onPress={submitComment}
              disabled={!commentText.trim() || submittingComment}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.commentInput}
              placeholder="اكتب تعليقاً..."
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              textAlign="right"
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  // ─── Main Render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="آخر الأخبار" showBack />

      {isLoading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="newspaper-outline" size={48} color={colors.primary} style={{ opacity: 0.5 }} />
          <Text style={{ fontFamily: 'Cairo-Regular', color: colors.textSecondary, marginTop: 16 }}>
            جاري تحميل الأخبار...
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 24 }}>
              <Ionicons
                name={errorMsg ? 'warning-outline' : 'newspaper-outline'}
                size={64}
                color={errorMsg ? colors.error : colors.border}
              />
              <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 16, color: errorMsg ? colors.error : colors.textSecondary, marginTop: 16, textAlign: 'center' }}>
                {errorMsg ? `خطأ: ${errorMsg}` : 'لا توجد أخبار حالياً'}
              </Text>
              {errorMsg && (
                <TouchableOpacity
                  onPress={fetchOffers}
                  style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
                >
                  <Text style={{ color: 'white', fontFamily: 'Cairo-Bold' }}>إعادة المحاولة</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {renderCommentsModal()}
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 16, paddingBottom: 40 },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  clinicAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e2e8f0',
  },
  postHeaderInfo: { flex: 1 },
  clinicNameText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.textMain,
  },
  postDate: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  newsBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newsBadgeText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 11,
    color: colors.primary,
  },
  image: { width: '100%', height: 200 },
  content: { padding: 14, gap: 8 },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 15,
    color: colors.textMain,
    textAlign: 'right',
  },
  description: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'right',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  date: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 11,
    color: colors.accent,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Actions Bar ───────────────────────────────────────────────────────────
  actionsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  actionText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },

  // ── Comments Modal ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
  },
  postSummary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  postSummaryTitle: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  commentsList: { flex: 1 },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.primary,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderTopRightRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  commentAuthor: {
    fontFamily: 'Cairo-Bold',
    fontSize: 12,
    color: colors.textMain,
    marginBottom: 2,
    textAlign: 'right',
  },
  commentContent: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textMain,
    borderWidth: 1,
    borderColor: colors.borderLight,
    maxHeight: 80,
    textAlign: 'right',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
