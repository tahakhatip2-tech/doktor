import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// ─── بطاقة Skeleton للموعد ───────────────────────────────────────────────────
export function AppointmentSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={skeletonStyles.content}>
        <Skeleton width="70%" height={16} borderRadius={8} />
        <Skeleton width="45%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
        <View style={skeletonStyles.row}>
          <Skeleton width={90} height={24} borderRadius={8} />
          <Skeleton width={70} height={24} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

// ─── بطاقة Skeleton للعيادة ─────────────────────────────────────────────────
export function ClinicSkeleton() {
  return (
    <View style={skeletonStyles.clinicCard}>
      <Skeleton width="100%" height={120} borderRadius={0} />
      <View style={{ padding: 14, gap: 8 }}>
        <Skeleton width="65%" height={16} />
        <Skeleton width="45%" height={12} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceLight,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  clinicCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
});
