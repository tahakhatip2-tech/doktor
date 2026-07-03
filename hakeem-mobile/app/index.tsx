import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  const portals = [
    {
      id: "doctor",
      icon: "stethoscope",
      title: "بوابة الأطباء",
      subtitle: "إدارة النظام والمواعيد",
      route: "/(auth)/login",
      colors: ["rgba(30, 64, 175, 0.6)", "rgba(30, 64, 175, 0.1)"], // Blue
      borderColor: "#1e40af",
    },
    {
      id: "patient",
      icon: "account-group-outline",
      title: "بوابة المرضى",
      subtitle: "حجز ومتابعة المواعيد",
      route: "/(auth)/patient-login",
      colors: ["rgba(180, 83, 9, 0.6)", "rgba(180, 83, 9, 0.1)"], // Orange
      borderColor: "#b45309",
    },
    {
      id: "pharmacy",
      icon: "pill",
      title: "بوابة الصيدليات",
      subtitle: "إدارة الوصفات الطبية",
      route: "/(auth)/pharmacy-login",
      colors: ["rgba(4, 120, 87, 0.6)", "rgba(4, 120, 87, 0.1)"], // Green
      borderColor: "#047857",
    },
  ];

  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.glassCard}>
          {/* Watermark text */}
          <Text style={styles.watermark}>Doctor Jo</Text>

          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/hakeem-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Doctor Jo</Text>

            <View style={styles.subtitleRow}>
              <MaterialCommunityIcons name="star-four-points" size={14} color="#60a5fa" />
              <Text style={styles.appTagline}>نظام إدارة العيادات الذكي</Text>
              <MaterialCommunityIcons name="star-four-points" size={14} color="#60a5fa" />
            </View>
            
            <Text style={styles.instructionText}>أرجو تحديد بوابة الدخول الخاصة بك</Text>
          </View>

          <View style={styles.portalsContainer}>
            {portals.map((portal) => (
              <TouchableOpacity
                key={portal.id}
                onPress={() => router.push(portal.route as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={portal.colors as [string, string]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={[styles.portalGradient, { borderColor: portal.borderColor }]}
                >
                  <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.5)" />
                  <View style={styles.portalText}>
                    <Text style={styles.portalTitle}>{portal.title}</Text>
                    <Text style={styles.portalSubtitle}>{portal.subtitle}</Text>
                  </View>
                  <View style={[styles.iconBox, { backgroundColor: portal.borderColor }]}>
                    <MaterialCommunityIcons name={portal.icon as any} size={24} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.visionBadge}>
              <MaterialCommunityIcons name="star-four-points" size={12} color="#60a5fa" />
              <Text style={styles.visionTitle}>رؤيتنا للمستقبل</Text>
              <MaterialCommunityIcons name="star-four-points" size={12} color="#60a5fa" />
            </View>
            
            <Text style={styles.visionText}>
              نسعى في Doctor Jo إلى تنظيم القطاع الصحي الخاص وتطوير طرق العلاج والمتابعة للوصول إلى نظام صحي عالمي.
            </Text>
            
            <Text style={styles.credits}>
              تم التطوير بكل شغف، بواسطة الخطيب للبرمجيات
            </Text>
            <Text style={styles.version}>
              DOCTOR JO . VERSION 2.1
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    top: "30%",
    left: "-10%",
    right: "-10%",
    textAlign: "center",
    fontSize: 80,
    fontFamily: "Cairo-Bold",
    color: "rgba(255, 255, 255, 0.03)",
    transform: [{ rotate: "0deg" }],
    zIndex: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    zIndex: 1,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontFamily: "Outfit-Bold",
    fontSize: 32,
    color: "#fff",
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  appTagline: {
    fontFamily: "Cairo-Bold",
    fontSize: 14,
    color: "#93c5fd",
  },
  instructionText: {
    fontFamily: "Cairo-Medium",
    fontSize: 13,
    color: "#cbd5e1",
  },
  portalsContainer: {
    gap: 16,
    marginBottom: 32,
    zIndex: 1,
  },
  portalGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  portalText: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 12,
  },
  portalTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
  },
  portalSubtitle: {
    fontFamily: "Cairo-Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  footer: {
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  visionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(30, 58, 138, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  visionTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 12,
    color: "#93c5fd",
  },
  visionText: {
    fontFamily: "Cairo-Regular",
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  credits: {
    fontFamily: "Cairo-Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    marginTop: 8,
  },
  version: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 2,
    textAlign: "center",
    paddingBottom: 12,
  },
});
