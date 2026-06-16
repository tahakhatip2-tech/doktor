import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  accent?: boolean;
}

export function Card({ children, style, title, subtitle, accent = false }: CardProps) {
  return (
    <View style={[styles.card, accent && styles.cardAccent, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
    color: colors.textMain,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
});
