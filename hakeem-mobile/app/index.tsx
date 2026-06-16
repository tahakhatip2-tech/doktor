import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/theme/colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const portals = [
    {
      id: 'doctor',
      emoji: '👨‍⚕️',
      title: 'بوابة الطبيب',
      subtitle: 'لوحة تحكم العيادة والمواعيد',
      route: '/(auth)/login',
      gradient: [colors.primary, colors.primaryDark] as [string, string],
      border: colors.primary,
    },
    {
      id: 'patient',
      emoji: '🧑‍💼',
      title: 'بوابة المريض',
      subtitle: 'حجز المواعيد والسجلات الطبية',
      route: '/(auth)/patient-login',
      gradient: [colors.accent, colors.accentDark] as [string, string],
      border: colors.accent,
    },
    {
      id: 'pharmacy',
      emoji: '💊',
      title: 'بوابة الصيدلية',
      subtitle: 'الوصفات الطبية والمخزون',
      route: '/(auth)/pharmacy-login',
      gradient: [colors.success, '#047857'] as [string, string],
      border: colors.success,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* الشعار والترحيب */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoEmoji}>🏥</Text>
        </View>
        <Text style={styles.appName}>حكيم جو</Text>
        <Text style={styles.appTagline}>نظام إدارة العيادات الذكي</Text>
      </View>

      {/* بطاقات البوابات */}
      <View style={styles.portalsContainer}>
        <Text style={styles.chooseLabel}>اختر بوابتك للمتابعة</Text>
        {portals.map((portal) => (
          <TouchableOpacity
            key={portal.id}
            style={[styles.portalCard, { borderColor: portal.border }]}
            onPress={() => router.push(portal.route as any)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={portal.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.portalGradient}
            >
              <Text style={styles.portalEmoji}>{portal.emoji}</Text>
              <View style={styles.portalText}>
                <Text style={styles.portalTitle}>{portal.title}</Text>
                <Text style={styles.portalSubtitle}>{portal.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>←</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.version}>الإصدار 1.0.0 © حكيم جو 2026</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 8,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontFamily: 'Cairo-Bold',
    fontSize: 30,
    color: colors.textMain,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },

  portalsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 24,
  },
  chooseLabel: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  portalCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  portalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  portalEmoji: {
    fontSize: 32,
  },
  portalText: {
    flex: 1,
    gap: 2,
  },
  portalTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.white,
  },
  portalSubtitle: {
    fontFamily: 'Cairo-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  arrow: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
  },

  version: {
    fontFamily: 'Cairo-Regular',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    paddingBottom: 12,
  },
});
