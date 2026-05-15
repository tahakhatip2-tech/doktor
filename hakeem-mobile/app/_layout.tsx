import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { I18nManager, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/auth.store';

// ── إجبار RTL من البداية ──
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 دقائق
    },
  },
});

SplashScreen.preventAutoHideAsync();

// ── Guard: يوجّه المستخدم بناءً على حالة المصادقة ──
function AuthGuard() {
  const { userType, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';
    const inPatientGroup = segments[0] === '(patient)';
    const inDoctorGroup = segments[0] === '(doctor)';

    if (!userType && !inAuthGroup && segments[0] !== undefined) {
      router.replace('/');
    } else if (userType === 'patient' && !inPatientGroup) {
      router.replace('/(patient)/dashboard');
    } else if (userType === 'doctor' && !inDoctorGroup) {
      router.replace('/(doctor)/dashboard');
    }
  }, [isInitialized, userType]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          <AuthGuard />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(patient)" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(doctor)" options={{ animation: 'slide_from_right' }} />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
