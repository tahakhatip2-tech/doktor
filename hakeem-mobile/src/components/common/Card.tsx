import React from 'react';
import { StyleSheet, View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
  accent?: boolean;
}

export function Card({ children, style, title, subtitle, accent = false }: CardProps) {
  return (
    <View style={[styles.card, accent && styles.cardAccent, style as ViewStyle]}>
      <View style={styles.glassEffect} />
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  glassEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  contentContainer: {
    padding: 18,
  },
  cardAccent: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
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
