import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { AppHeader, EmptyState, useToast, Toast } from '../../../src/components/common';
import { offersApi } from '../../../src/api/modules.api';
import { Offer } from '../../../src/types/clinic.types';

export default function OffersScreen() {
  const { toast, show: showToast, hide: hideToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await offersApi.getAll();
      setOffers(res.data);
    } catch (err) {
      showToast('حدث خطأ أثناء تحميل العروض', 'error');
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

  const toggleLike = async (offer: Offer) => {
    const isLiked = offer.isLiked;
    
    setOffers(prev => prev.map(o => {
      if (o.id === offer.id) {
        return { ...o, isLiked: !isLiked };
      }
      return o;
    }));

    try {
      if (isLiked) {
        await offersApi.unlike(offer.id);
      } else {
        await offersApi.like(offer.id);
      }
    } catch (err) {
      setOffers(prev => prev.map(o => {
        if (o.id === offer.id) {
          return { ...o, isLiked };
        }
        return o;
      }));
      showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    }
  };

  const renderItem = ({ item }: { item: Offer }) => {
    const isLiked = item.isLiked;
    // استخدام صورة احتياطية في حال لم تتوفر من الـ API
    const imageUri = item.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80';
    const expireDate = item.endDate ? new Date(item.endDate).toLocaleDateString('ar-SA') : 'غير محدد';
    
    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>عرض خاص</Text>
        </View>
        <TouchableOpacity style={styles.likeBtn} onPress={() => toggleLike(item)}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? colors.error : colors.white} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.content}</Text>
          <View style={styles.footer}>
            <Ionicons name="time-outline" size={16} color={colors.accent} />
            <Text style={styles.date}>صالح حتى {expireDate}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="العروض والخصومات" showBack />
      
      {isLoading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="gift-outline" size={48} color={colors.primary} style={{ opacity: 0.5 }} />
          <Text style={{ fontFamily: 'Cairo-Regular', color: colors.textSecondary, marginTop: 16 }}>جاري تحميل العروض...</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="gift-outline"
              title="لا توجد عروض حالياً"
              subtitle="ترقب عروض وخصومات مميزة قريباً من العيادات والصيدليات"
            />
          }
        />
      )}
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  image: {
    width: '100%',
    height: 160,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  discountText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: colors.white,
  },
  likeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    padding: 16,
    gap: 6,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
  },
  description: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  date: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 12,
    color: colors.accent,
  },
});
