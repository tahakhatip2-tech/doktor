import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { CustomTabBar } from '../../src/components/common';

export default function PatientLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
        name="medical-records/index"
        options={{
          title: 'السجلات',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'محادثاتي',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
        }}
      />

      {/* شاشات مخفية من شريط التنقل السفلي - تنتقل للقائمة المنسدلة */}
      <Tabs.Screen name="settings/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="offers/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile/index" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      {/* screens like clinic/[id] are not here but inherited naturally */}
    </Tabs>
  );
}
