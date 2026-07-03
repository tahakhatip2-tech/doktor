import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { CustomTabBar } from '../../src/components/common';

export default function DoctorLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="appointments/index"
        options={{
          title: 'المواعيد',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients/index"
        options={{
          title: 'المرضى',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="financial/index"
        options={{
          title: 'المالية',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        }}
      />
      
      {/* مخفية من الشريط وتنتقل للقائمة المنسدلة */}
      <Tabs.Screen
        name="settings/index"
        options={{
          href: null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tabs>
  );
}
