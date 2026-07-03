import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/auth.store';
import { colors } from '../../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Button, AppHeader, ConfirmModal, useToast, Toast } from '../../../src/components/common';

export default function DoctorSettingsScreen() {
  const { doctorUser, logout } = useAuthStore() as any;
  const { toast, show, hide } = useToast();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const menuItems = [
    { id: 'profile', icon: 'person-outline', title: 'الملف الشخصي للعيادة', color: colors.primary },
    { id: 'services', icon: 'medical-outline', title: 'الخدمات الطبية والأسعار', color: colors.success },
    { id: 'whatsapp', icon: 'logo-whatsapp', title: 'إعدادات واتساب', color: '#25D366' },
    { id: 'templates', icon: 'document-text-outline', title: 'نماذج الرسائل', color: colors.info },
    { id: 'notifications', icon: 'notifications-outline', title: 'الإشعارات', color: colors.warning },
    { id: 'security', icon: 'shield-checkmark-outline', title: 'تغيير كلمة المرور', color: colors.textSecondary },
  ];

  const handleMenuPress = (item: any) => {
    show('هذه الميزة ستتوفر قريباً', 'info');
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="إعدادات العيادة" showBack={false} />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Doctor Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctorUser?.name?.[0] || 'د'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>د. {doctorUser?.name || 'طبيب'}</Text>
            <Text style={styles.email}>{doctorUser?.email || 'البريد الإلكتروني'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Info Note about Whatsapp */}
        <View style={styles.whatsappNote}>
          <View style={styles.whatsappNoteHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#25D366" />
            <Text style={styles.whatsappNoteTitle}>تنبيه بخصوص واتساب</Text>
          </View>
          <Text style={styles.whatsappNoteText}>
            البوت التلقائي والمراسلات عبر واتساب ويب تعمل بشكل أفضل من خلال لوحة التحكم على جهاز الكمبيوتر.
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-back" size={20} color={colors.borderLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <Button 
          title="تسجيل الخروج" 
          variant="danger" 
          icon={<Ionicons name="log-out-outline" size={20} color={colors.white} />}
          onPress={() => setLogoutModalVisible(true)}
          style={{ marginTop: 8 }}
        />
        
      </ScrollView>

      <ConfirmModal
        visible={logoutModalVisible}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج من حساب العيادة؟"
        confirmText="نعم، تسجيل خروج"
        cancelText="تراجع"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onClose={() => setLogoutModalVisible(false)}
      />

      <Toast {...toast} onHide={hide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarText: {
    fontFamily: 'Cairo-Bold',
    fontSize: 28,
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Cairo-Bold',
    fontSize: 18,
    color: colors.textMain,
  },
  email: {
    fontFamily: 'Cairo-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
  },
  whatsappNote: {
    backgroundColor: '#25D36615',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  whatsappNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  whatsappNoteTitle: {
    fontFamily: 'Cairo-Bold',
    fontSize: 14,
    color: '#25D366',
  },
  whatsappNoteText: {
    fontFamily: 'Cairo-Regular',
    fontSize: 13,
    color: colors.textMain,
    lineHeight: 22,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  menuTitle: {
    fontFamily: 'Cairo-SemiBold',
    fontSize: 15,
    color: colors.textMain,
    flex: 1,
    textAlign: 'left',
  },
});
