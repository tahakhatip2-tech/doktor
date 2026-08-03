import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { CustomTabBar } from '../../src/components/common';
import { notificationsApi } from '../../src/api/modules.api';
import { conversationsApi } from '../../src/api/patient.api';

export default function PatientLayout() {
  const { data: unreadNotifs } = useQuery({
    queryKey: ['patient-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount().then(r => r.data.count),
    refetchInterval: 30000,
  });

  const { data: conversations } = useQuery({
    queryKey: ['patient-conversations-badge'],
    queryFn: () => conversationsApi.getAll().then(r => r.data),
    refetchInterval: 15000,
  });

  const unreadChats = (conversations || []).reduce(
    (sum: number, c: any) => sum + (c.unreadCount || 0), 0
  );

  return (
    <Tabs
      initialRouteName="home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* ── 5 تبويبات ظاهرة ── */}
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
        name="home"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="offers/index"
        options={{
          title: 'آخر الأخبار',
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          title: 'محادثاتي',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
        }}
      />

      {/* ── شاشات مخفية (لا تظهر في الشريط) ── */}
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
      <Tabs.Screen name="medical-records/index" options={{ href: null }} />
      <Tabs.Screen name="medical-records/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/index" options={{ href: null }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="chat/[clinicId]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
