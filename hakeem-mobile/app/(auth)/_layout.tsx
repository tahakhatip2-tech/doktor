import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // سنقوم ببناء Header مخصص إذا لزم الأمر
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="patient-login" />
      <Stack.Screen name="patient-register" />
    </Stack>
  );
}
