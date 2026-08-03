import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { CustomTabBar } from '../../src/components/common';
import { doctorAppointmentsApi } from '../../src/api/appointments.api';
import { apiClient } from '../../src/api/client';

export default function DoctorLayout() {
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ['doctor-stats-badge'],
    queryFn: () => doctorAppointmentsApi.getStats().then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: chatData } = useQuery({
    queryKey: ['doctor-chat-unread'],
    queryFn: () => apiClient.get('/internal-chat/unread-count').then(r => r.data),
    refetchInterval: 15000,
  });

  const pendingCount = stats?.today_waiting ?? 0;
  const unreadChat = chatData?.count ?? 0;

  return (
    <Tabs
      initialRouteName="dashboard"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* ── الشريط السفلي الرئيسي (5 تبويبات) ── */}
      <Tabs.Screen
        name="appointments/index"
        options={{
          title: 'المواعيد',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
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
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'الرسائل',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          tabBarBadge: unreadChat > 0 ? unreadChat : undefined,
        }}
      />
      <Tabs.Screen
        name="financial/index"
        options={{
          title: 'المحاسبة',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        }}
      />

      {/* ── شاشات مخفية من الشريط (يمكن الوصول إليها من الهيدر أو الداشبورد) ── */}
      <Tabs.Screen name="clinic-doctors/index" options={{ href: null }} />
      <Tabs.Screen name="offers/index" options={{ href: null }} />
      <Tabs.Screen name="templates/index" options={{ href: null }} />
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="ai-chat/index" options={{ href: null }} />

      {/* شاشات التفاصيل */}
      <Tabs.Screen name="appointments/[id]" options={{ href: null }} />
      <Tabs.Screen name="patients/[id]" options={{ href: null }} />
    </Tabs>
  );
}
