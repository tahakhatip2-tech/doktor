import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/auth.store';
import { colors } from '../../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Button, ScreenHeader, ConfirmModal, useToast, Toast } from '../../../src/components/common';

export default function SettingsScreen() {
  const router = useRouter();
  const { patientUser, logout } = useAuthStore() as any;
  const { toast, show, hide } = useToast();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const menuItems = [
    { id: 'profile', icon: 'person-outline', title: 'الملف الشخصي', color: colors.primary, route: '/(patient)/profile' },
    { id: 'records', icon: 'document-text-outline', title: 'السجلات الطبية', color: colors.success, route: '/(patient)/medical-records' },
    { id: 'notifications', icon: 'notifications-outline', title: 'الإشعارات', color: colors.warning, route: '/(patient)/notifications' },
    { id: 'security', icon: 'shield-checkmark-outline', title: 'الأمان وكلمة المرور', color: colors.textSecondary, route: null },
    { id: 'help', icon: 'help-circle-outline', title: 'المساعدة والدعم', color: colors.textSecondary, route: null },
  ];

  const handlePress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else {
      show('هذه الميزة قيد التطوير حالياً', 'info');
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  const name = patientUser?.fullName || patientUser?.name || 'مريض';
  const initial = name.charAt(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="الإعدادات" />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>{patientUser?.phone || 'رقم الهاتف غير متاح'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => router.push('/(patient)/profile')}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
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
              onPress={() => handlePress(item)}
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
        message="هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟"
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
  phone: {
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
