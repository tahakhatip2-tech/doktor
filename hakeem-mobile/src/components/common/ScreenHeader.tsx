import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightIconBadge?: number;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  gradient?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  rightIcon,
  rightIconBadge,
  onRightPress,
  rightComponent,
  transparent = false,
  gradient = false,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.inner, { paddingTop: insets.top + 10 }]}>
      {/* زر الرجوع */}
      <View style={styles.leftSlot}>
        {showBack && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.textMain} />
          </TouchableOpacity>
        )}
      </View>

      {/* العنوان */}
      <View style={styles.centerSlot}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* الجانب الأيسر */}
      <View style={styles.rightSlot}>
        {rightComponent ? (
          rightComponent
        ) : rightIcon ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textMain} />
            {rightIconBadge && rightIconBadge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {rightIconBadge > 99 ? '99+' : rightIconBadge}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </View>
  );

  if (transparent) {
    return <View style={styles.containerTransparent}>{content}</View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bottomBorder} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  containerTransparent: {
    backgroundColor: 'transparent',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: colors.border,
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 9,
    color: colors.white,
  },
});
