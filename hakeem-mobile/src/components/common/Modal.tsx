import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scrollable = true,
  size = 'md',
}: ModalProps) {
  const translateY = useSharedValue(800);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(800, { duration: 300 });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const maxHeight = size === 'full' ? '95%' : size === 'lg' ? '85%' : size === 'sm' ? '45%' : '70%';

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { showsVerticalScrollIndicator: false, keyboardShouldPersistTaps: 'handled' as const }
    : {};

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        {/* Backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.75)' }]} />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, { maxHeight }, sheetStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          {(title || subtitle) && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <ContentWrapper {...contentProps} style={styles.content}>
            {children}
          </ContentWrapper>

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

// ─── مودال التأكيد البسيط ───────────────────────────────────────────────────
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  confirmVariant = 'primary',
  loading = false,
  children,
}: ConfirmModalProps) {
  const themeColor = confirmVariant === 'danger' ? colors.error : colors.primary;

  return (
    <Modal visible={visible} onClose={onClose} size="sm" scrollable={false}>
      <View style={confirmStyles.container}>
        {/* Glow behind icon */}
        <View style={confirmStyles.iconContainer}>
          <View style={[confirmStyles.iconGlow, { backgroundColor: themeColor }]} />
          <View style={[confirmStyles.iconCircle, { backgroundColor: `${themeColor}20`, borderColor: `${themeColor}40` }]}>
            <Ionicons
              name={confirmVariant === 'danger' ? 'warning-outline' : 'checkmark-circle-outline'}
              size={36}
              color={themeColor}
            />
          </View>
        </View>

        <Text style={confirmStyles.title}>{title}</Text>
        <Text style={confirmStyles.message}>{message}</Text>
        
        {children && <View style={{ width: '100%', marginTop: 10 }}>{children}</View>}

        <View style={confirmStyles.actions}>
          <TouchableOpacity style={confirmStyles.cancelBtn} onPress={onClose}>
            <Text style={confirmStyles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[confirmStyles.confirmBtn, { backgroundColor: themeColor }]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={confirmStyles.confirmText}>
              {loading ? 'جاري...' : confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 24,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
});

const confirmStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 12,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
    shadowColor: 'currentColor',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: colors.textMain,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontFamily: 'Cairo-Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelText: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 16,
    color: colors.textMain,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
