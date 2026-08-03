import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children?: React.ReactNode; // أزرار أو chips أسفل العنوان
  showClock?: boolean;
}

export function PageHero({
  title,
  subtitle,
  icon = 'sparkles-outline',
  iconColor = '#f97316',
  children,
  showClock = true,
}: PageHeroProps) {
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!showClock) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [showClock]);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
  const dateStr = now.toLocaleDateString('ar-SA', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0a1628', '#0d1b40', '#1a2f6e']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow accents */}
      <View style={styles.glowBlue} />
      <View style={styles.glowOrange} />

      {/* Scanlines texture */}
      <View style={styles.scanlines} />

      {/* Content */}
      <View style={styles.inner}>
        {/* Left: badge + title */}
        <View style={styles.leftSide}>
          {/* Micro badge */}
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>HAKEEM JO • MEDICAL SYSTEM</Text>
          </View>

          {/* Icon + Title */}
          <View style={styles.titleRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${iconColor}25` }]}>
              <Ionicons name={icon} size={22} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
            </View>
          </View>

          {/* Children (chips / actions) */}
          {children ? <View style={styles.childrenRow}>{children}</View> : null}
        </View>

        {/* Right: clock widget */}
        {showClock ? (
          <View style={styles.clockWidget}>
            <View style={styles.clockRow}>
              <Ionicons name="time-outline" size={13} color="#f97316" />
              <Text style={styles.clockTime}>{timeStr}</Text>
            </View>
            <View style={styles.clockDivider} />
            <View style={styles.clockDateRow}>
              <Ionicons name="calendar-outline" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.clockDate}>{dateStr}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Bottom fade */}
      <LinearGradient
        colors={['transparent', 'rgba(15,23,42,0.6)']}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      {/* Bottom glow line */}
      <View style={styles.glowLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    minHeight: 120,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  leftSide: { flex: 1, gap: 8 },

  // Glow
  glowBlue: {
    position: 'absolute', top: -30, left: -30,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#2563eb',
    opacity: 0.12,
  },
  glowOrange: {
    position: 'absolute', bottom: -20, right: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#f97316',
    opacity: 0.08,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.015,
    backgroundColor: 'transparent',
  },

  // Badge
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37,99,235,0.2)',
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#f97316',
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 3,
  },
  badgeText: {
    fontFamily: 'Cairo-Bold', fontSize: 8,
    color: 'rgba(219,234,254,0.8)',
    letterSpacing: 0.8,
  },

  // Title
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontFamily: 'Cairo-Bold', fontSize: 18,
    color: '#fff', letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: 'Cairo-Regular', fontSize: 11,
    color: 'rgba(147,197,253,0.7)', marginTop: 2, lineHeight: 16,
  },

  childrenRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2,
  },

  // Clock
  clockWidget: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10,
    alignItems: 'flex-end', gap: 4, minWidth: 110,
  },
  clockRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  clockTime: {
    fontFamily: 'Cairo-Bold', fontSize: 15,
    color: '#fff', letterSpacing: 0.5,
  },
  clockDivider: {
    width: '100%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  clockDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clockDate: {
    fontFamily: 'Cairo-Regular', fontSize: 10,
    color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3,
  },

  // Bottom
  bottomFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 20,
  },
  glowLine: {
    height: 1.5,
    backgroundColor: 'rgba(37,99,235,0.5)',
  },
});
