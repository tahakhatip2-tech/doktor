import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Cairo-SemiBold',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clinics/index"
        options={{
          title: 'العيادات',
          tabBarIcon: ({ color, size }) => <Ionicons name="medical" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments/index"
        options={{
          title: 'مواعيدي',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'محادثاتي',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'حسابي',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />

      {/* شاشات مخفية من شريط التنقل السفلي */}
      <Tabs.Screen name="notifications/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="medical-records/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="offers/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
