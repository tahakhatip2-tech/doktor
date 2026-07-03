import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

const TOAST_CONFIG: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  success: { icon: 'checkmark-circle', color: colors.success, bg: `${colors.success}15` },
  error: { icon: 'close-circle', color: colors.error, bg: `${colors.error}15` },
  warning: { icon: 'warning', color: colors.warning, bg: `${colors.warning}15` },
  info: { icon: 'information-circle', color: colors.info, bg: `${colors.info}15` },
};

export function Toast({ visible, message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15 }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const config = TOAST_CONFIG[type];

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.toast, { backgroundColor: config.bg, borderColor: `${config.color}40` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
        <Text style={[styles.message, { color: config.color }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Hook لإدارة Toast ────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = React.useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const show = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hide = () => setToast(prev => ({ ...prev, visible: false }));

  return { toast, show, hide };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    flex: 1,
  },
});
