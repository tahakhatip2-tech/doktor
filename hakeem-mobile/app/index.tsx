import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
      
      {/* قسم الشعار والترحيب */}
      <View className="items-center mb-16">
        <View className="w-24 h-24 bg-surfaceLight rounded-3xl mb-6 items-center justify-center">
            <Text className="text-4xl">🏥</Text>
        </View>
        <Text className="text-3xl font-bold text-textMain mb-2 text-center" style={{ fontFamily: 'Cairo-Bold' }}>
          حكيم جو
        </Text>
        <Text className="text-lg text-textSecondary text-center" style={{ fontFamily: 'Cairo-Regular' }}>
          نظام إدارة العيادات الذكي والمواعيد
        </Text>
      </View>

      {/* خيارات الدخول */}
      <View className="w-full gap-y-4">
        <TouchableOpacity
          className="bg-primary w-full py-4 rounded-2xl flex-row justify-center items-center"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white text-lg font-bold" style={{ fontFamily: 'Cairo-SemiBold' }}>
            دخول الأطباء والعيادات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface w-full py-4 rounded-2xl flex-row justify-center items-center border border-border"
          onPress={() => router.push('/(auth)/patient-login')}
        >
          <Text className="text-secondary text-lg font-bold" style={{ fontFamily: 'Cairo-SemiBold' }}>
            دخول المرضى والمراجعين
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-textSecondary text-xs absolute bottom-10" style={{ fontFamily: 'Cairo-Regular' }}>
        الإصدار 1.0.0
      </Text>
    </SafeAreaView>
  );
}
