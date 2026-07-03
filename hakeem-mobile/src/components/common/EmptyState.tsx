import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  emoji,
  title,
  subtitle,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* الأيقونة */}
      <View style={styles.iconContainer}>
        <View style={styles.iconGlow} />
        <View style={styles.iconWrapper}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : icon ? (
            <Ionicons name={icon} size={42} color={colors.primaryLight} />
          ) : null}
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? <View style={styles.actionWrapper}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    opacity: 0.2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionWrapper: {
    marginTop: 32,
    width: '100%',
  },
});
