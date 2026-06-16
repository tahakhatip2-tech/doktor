import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/auth.store';
import { colors } from '../../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../src/components/common';

export default function DoctorSettingsScreen() {
  const { doctorUser, logout } = useAuthStore() as any;

  const menuItems = [
    { id: 'profile', icon: 'person-outline', title: 'الملف الشخصي للعيادة', color: colors.primary },
    { id: 'services', icon: 'medical-outline', title: 'الخدمات الطبية والأسعار', color: colors.success },
    { id: 'whatsapp', icon: 'logo-whatsapp', title: 'إعدادات واتساب', color: '#25D366' },
    { id: 'templates', icon: 'document-text-outline', title: 'نماذج الرسائل', color: colors.info },
    { id: 'notifications', icon: 'notifications-outline', title: 'الإشعارات', color: colors.warning },
    { id: 'security', icon: 'shield-checkmark-outline', title: 'تغيير كلمة المرور', color: colors.textSecondary },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 24, color: colors.textMain, marginBottom: 24, textAlign: 'left' }}>إعدادات العيادة</Text>
        
        {/* Doctor Card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <Text style={{ fontSize: 32, color: colors.white }}>{doctorUser?.name?.[0] || 'د'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 18, color: colors.textMain, textAlign: 'left' }}>
              د. {doctorUser?.name || 'طبيب'}
            </Text>
            <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'left' }}>
              {doctorUser?.email || 'البريد الإلكتروني'}
            </Text>
          </View>
          <TouchableOpacity style={{ padding: 8, backgroundColor: colors.surfaceLight, borderRadius: 8 }}>
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Info Note about Whatsapp */}
        <View style={{ backgroundColor: '#25D36615', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#25D366' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="information-circle-outline" size={18} color="#25D366" />
            <Text style={{ fontFamily: 'Cairo-Bold', fontSize: 14, color: '#25D366', textAlign: 'left' }}>تنبيه بخصوص واتساب</Text>
          </View>
          <Text style={{ fontFamily: 'Cairo-Regular', fontSize: 13, color: colors.textMain, textAlign: 'left', lineHeight: 22 }}>
            البوت التلقائي والمراسلات عبر واتساب ويب تعمل بشكل أفضل من خلال لوحة التحكم على جهاز الكمبيوتر.
          </Text>
        </View>

        {/* Menu Items */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 24 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                padding: 16,
                borderBottomWidth: index === menuItems.length - 1 ? 0 : 1,
                borderBottomColor: colors.borderLight
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${item.color}15`, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={{ fontFamily: 'Cairo-SemiBold', fontSize: 15, color: colors.textMain, flex: 1, textAlign: 'left' }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <Button 
          title="تسجيل الخروج" 
          variant="danger" 
          icon={<Ionicons name="log-out-outline" size={20} color={colors.white} />}
          onPress={logout}
        />
        
      </ScrollView>
    </SafeAreaView>
  );
}
