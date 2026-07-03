import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

type Variant = 'primary' | 'accent' | 'success' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  // Helper to determine if button should have gradient/solid background
  const renderBackground = () => {
    switch (variant) {
      case 'primary':
        return (
          <LinearGradient
            colors={[colors.primaryLight, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        );
      case 'accent':
        return (
          <LinearGradient
            colors={[colors.accentLight, colors.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        );
      case 'success':
        return (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.success }]} />
        );
      case 'danger':
        return (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.error }]} />
        );
      case 'outline':
      case 'ghost':
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[
        containerStyle,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderBackground()}
      
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },

  // المتغيرات
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  ghost: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  disabled: {
    opacity: 0.5,
  },

  // الأحجام
  size_sm: { paddingVertical: 10, paddingHorizontal: 16 },
  size_md: { paddingVertical: 16, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 24 },

  // النصوص
  text: {
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  text_primary: { color: colors.white },
  text_accent: { color: colors.white },
  text_success: { color: colors.white },
  text_outline: { color: colors.textMain },
  text_ghost: { color: colors.textMain },
  text_danger: { color: colors.white },

  textSize_sm: { fontSize: 14 },
  textSize_md: { fontSize: 16 },
  textSize_lg: { fontSize: 18 },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1, // To appear above absolute background
  },
  iconWrapper: {
    marginRight: 4,
  },
});
