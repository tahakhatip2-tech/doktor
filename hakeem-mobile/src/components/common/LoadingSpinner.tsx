import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = 'جاري التحميل...', fullScreen = false }: LoadingProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message && <Text style={styles.overlayText}>{message}</Text>}
      </View>
    </View>
  );
}

// Skeleton مستطيل للتحميل
export function SkeletonBox({ width, height, radius = 8 }: { width: number | string; height: number; radius?: number }) {
  return (
    <View style={[styles.skeleton, { width: width as number, height, borderRadius: radius }]} />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlayText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 15,
    color: colors.textMain,
  },
  skeleton: {
    backgroundColor: colors.surfaceLight,
    overflow: 'hidden',
  },
});
