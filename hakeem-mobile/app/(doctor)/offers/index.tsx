import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Linking, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../src/theme/colors';
import { apiClient } from '../../../src/api/client';
import { AppHeader, Modal, useToast, Toast } from '../../../src/components/common';

interface Offer {
  id: number;
  title: string;
  content: string;
  image?: string;
  externalLink?: string;
  createdAt: string;
  isActive: boolean;
}

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace('/api', '');

export default function DoctorOffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { toast, show, hide } = useToast();

  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/offers/mine');
      setOffers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      // If no own offers, fetch all offers as fallback
      if ((Array.isArray(res.data) ? res.data : (res.data?.data || [])).length === 0) {
        const allRes = await apiClient.get('/patient/offers');
        setOffers(Array.isArray(allRes.data) ? allRes.data : (allRes.data?.data || []));
      }
    } catch {
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, []);

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      show('تعذّر فتح الرابط', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="آخر الأخبار والعروض" showBack={false} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : offers.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="newspaper-outline" size={60} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد أخبار حالياً</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedOffer(item)}
              activeOpacity={0.88}
            >
              {item.image && (
                <Image
                  source={{ uri: item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}` }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
              {!item.image && (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="newspaper-outline" size={40} color={colors.primary} />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>
                    {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                  </Text>
                  <View style={styles.readMore}>
                    <Text style={styles.readMoreText}>اقرأ المزيد</Text>
                    <Ionicons name="arrow-back" size={14} color={colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal تفاصيل الخبر */}
      <Modal visible={!!selectedOffer} onClose={() => setSelectedOffer(null)} size="md">
        {selectedOffer && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedOffer.image && (
              <Image
                source={{ uri: selectedOffer.image.startsWith('http') ? selectedOffer.image : `${API_BASE}${selectedOffer.image}` }}
                style={styles.modalImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.modalTitle}>{selectedOffer.title}</Text>
            <Text style={styles.modalDate}>
              {new Date(selectedOffer.createdAt).toLocaleDateString('ar-SA')}
            </Text>
            <Text style={styles.modalContent}>{selectedOffer.content}</Text>
            {selectedOffer.externalLink && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleOpenLink(selectedOffer.externalLink!)}
              >
                <Ionicons name="open-outline" size={18} color="#fff" />
                <Text style={styles.linkBtnText}>فتح الرابط</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </Modal>

      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain },
  list: { padding: 16, gap: 16, paddingBottom: 40 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: {
    width: '100%', height: 140,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { padding: 16 },
  cardTitle: { fontFamily: 'Cairo-Bold', fontSize: 16, color: colors.textMain, marginBottom: 8 },
  cardContent: { fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textSecondary, lineHeight: 22, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textMuted },
  readMore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { fontFamily: 'Cairo-Bold', fontSize: 12, color: colors.primary },

  modalImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  modalTitle: { fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, marginBottom: 4 },
  modalDate: { fontFamily: 'Cairo-Regular', fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  modalContent: { fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, lineHeight: 24 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: 16,
    marginTop: 20,
  },
  linkBtnText: { fontFamily: 'Cairo-Bold', fontSize: 15, color: '#fff' },
});
