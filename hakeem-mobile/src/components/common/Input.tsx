import { StyleSheet, View, TextInput, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useState } from 'react';
import { colors } from '../../theme/colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  icon?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  icon,
  autoCapitalize = 'none',
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        focused && styles.inputFocused,
        error && styles.inputError,
        !editable && styles.inputDisabled,
      ]}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[styles.input, !!icon && styles.inputWithIcon, !!multiline && styles.multiline]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign="right"
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primary}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  input: {
    flex: 1,
    fontFamily: 'Cairo-Regular',
    fontSize: 15,
    color: colors.textMain,
    paddingVertical: 14,
  },
  inputWithIcon: {
    marginRight: 10,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  iconLeft: {
    marginLeft: 10,
  },
  eyeBtn: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
    opacity: 0.8,
  },
  errorText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.error,
    textAlign: 'right',
    marginTop: -2,
  },
});
