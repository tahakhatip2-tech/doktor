import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || '';

interface AppHeaderProps {
  showBack?: boolean;
  onBackPress?: () => void;
  title?: string;
  subtitle?: string;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  showMessages?: boolean;
  messageCount?: number;
  onMessagesPress?: () => void;
  rightComponent?: React.ReactNode;
}

function getAvatarUri(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return `${API_BASE_URL}${avatar}`;
}

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppHeader({
  showBack = false,
  onBackPress,
  title,
  subtitle,
  showNotification = true,
  notificationCount = 0,
  onNotificationPress,
  showMessages = true,
  messageCount = 0,
  onMessagesPress,
  rightComponent,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userType, doctorUser, patientUser, pharmacyUser, logout } = useAuthStore() as any;

  const activeUser =
    userType === 'doctor'
      ? doctorUser
      : userType === 'patient'
      ? patientUser
      : pharmacyUser;

  const userName: string =
    activeUser?.name ||
    activeUser?.full_name ||
    activeUser?.pharmacy_name ||
    '';

  const avatarUri = getAvatarUri(activeUser?.avatar || activeUser?.profile_picture);
  const initials = getInitials(userName);

  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleLogout = async () => {
    closeMenu();
    setTimeout(async () => {
      await logout();
      router.replace('/(auth)/login');
    }, 200);
  };

  const roleLabel =
    userType === 'doctor'
      ? 'بوابة الأطباء'
      : userType === 'patient'
      ? 'بوابة المرضى'
      : userType === 'pharmacy'
      ? 'بوابة الصيدليات'
      : '';

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['rgba(13,27,64,0.97)', 'rgba(22,45,100,0.96)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowLine} />

        <View style={styles.inner}>
          {/* ── LEFT: Logo + App Name (or Back Arrow) ── */}
          <View style={styles.brandSlot}>
            {showBack ? (
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={onBackPress || (() => router.back())}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
            <View style={styles.brand}>
              <View style={styles.logoWrap}>
                <LinearGradient
                  colors={['#2563eb', '#f97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGlow}
                />
                <Image
                  source={require('../../../assets/hakeem-logo.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>
                <Text style={{ color: '#60a5fa' }}>DOCTOR</Text>
                <Text style={{ color: '#fb923c' }}> JO</Text>
              </Text>
            </View>
          </View>

          {/* ── RIGHT: Actions + Profile ── */}
          <View style={styles.actionsSlot}>
            {rightComponent ? (
              rightComponent
            ) : (
              <>
                {showMessages && (
                  <TouchableOpacity
                    style={styles.iconCircle}
                    onPress={onMessagesPress}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                    {messageCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {messageCount > 9 ? '9+' : messageCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                {showNotification && (
                  <TouchableOpacity
                    style={styles.iconCircle}
                    onPress={onNotificationPress}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                    {notificationCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}

                {/* Profile with Hamburger */}
                <TouchableOpacity
                  style={[styles.avatarWrap, { marginLeft: 4 }]}
                  onPress={openMenu}
                  activeOpacity={0.8}
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                  ) : (
                    <LinearGradient
                      colors={['#2563eb', '#1e40af']}
                      style={styles.avatarFallback}
                    >
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </LinearGradient>
                  )}
                  {/* Hamburger Menu Badge */}
                  <View style={styles.hamburgerBadge}>
                    <View style={styles.hamburgerLine} />
                    <View style={[styles.hamburgerLine, { width: 5 }]} />
                    <View style={styles.hamburgerLine} />
                    {/* Green online dot */}
                    <View style={styles.hamburgerDot} />
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.dropdown,
              {
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['#0d1b40', '#1a3166']}
              style={styles.dropBrand}
            >
              <View style={styles.dropLogoWrap}>
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={styles.dropLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.dropAppName}>DOCTOR JO</Text>
              <Text style={styles.dropAppSub}>Clinic Management System</Text>
            </LinearGradient>

            <View style={styles.dropUserRow}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.dropAvatar} />
              ) : (
                <LinearGradient
                  colors={['#2563eb', '#1e40af']}
                  style={styles.dropAvatarFallback}
                >
                  <Text style={styles.dropInitials}>{initials}</Text>
                </LinearGradient>
              )}
              <View style={styles.dropUserInfo}>
                <Text style={styles.dropUserName} numberOfLines={1}>
                  {userName || 'المستخدم'}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{roleLabel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.menuItems}>
              {userType === 'patient' && (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(patient)/profile'), 200); }} activeOpacity={0.7}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#eff6ff' }]}>
                      <Ionicons name="person-outline" size={18} color="#2563eb" />
                    </View>
                    <Text style={styles.menuItemText}>الملف الشخصي</Text>
                    <Ionicons name="chevron-back" size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(patient)/offers'), 200); }} activeOpacity={0.7}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#fef3c7' }]}>
                      <Ionicons name="pricetag-outline" size={18} color="#d97706" />
                    </View>
                    <Text style={styles.menuItemText}>العروض والخصومات</Text>
                    <Ionicons name="chevron-back" size={16} color="#94a3b8" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(patient)/settings'), 200); }} activeOpacity={0.7}>
                    <View style={[styles.menuItemIcon, { backgroundColor: '#f1f5f9' }]}>
                      <Ionicons name="settings-outline" size={18} color="#475569" />
                    </View>
                    <Text style={styles.menuItemText}>الإعدادات</Text>
                    <Ionicons name="chevron-back" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </>
              )}

              {userType === 'doctor' && (
                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(doctor)/settings'), 200); }} activeOpacity={0.7}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#f1f5f9' }]}>
                    <Ionicons name="settings-outline" size={18} color="#475569" />
                  </View>
                  <Text style={styles.menuItemText}>الإعدادات</Text>
                  <Ionicons name="chevron-back" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              {userType === 'pharmacy' && (
                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(pharmacy)/settings'), 200); }} activeOpacity={0.7}>
                  <View style={[styles.menuItemIcon, { backgroundColor: '#f1f5f9' }]}>
                    <Ionicons name="settings-outline" size={18} color="#475569" />
                  </View>
                  <Text style={styles.menuItemText}>الإعدادات</Text>
                  <Ionicons name="chevron-back" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: '#fff1f2' }]}>
                  <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                </View>
                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>تسجيل الخروج</Text>
                <Ionicons name="chevron-back" size={16} color="#fca5a5" />
              </TouchableOpacity>
            </View>

            <Text style={styles.dropFooter}>Powered by Al-Khatib</Text>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    overflow: 'visible',
  },
  glowLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(37,99,235,0.4)',
  },
  inner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 52,
  },
  brandSlot: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  actionsSlot: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Cairo-Bold',
  },
  hamburgerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0d1b40',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  hamburgerLine: {
    width: 9,
    height: 1.5,
    backgroundColor: '#2563eb',
    borderRadius: 1,
  },
  hamburgerDot: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 6,
    height: 6,
    backgroundColor: '#22c55e',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  brand: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  logoWrap: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  logoGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 10,
    opacity: 0.25,
    transform: [{ scale: 1.15 }],
  },
  logoImg: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  brandText: {
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
    color: '#fff',
    letterSpacing: 1.2,
    lineHeight: 18,
  },
  appSub: {
    fontSize: 9,
    fontFamily: 'Cairo-Regular',
    color: '#93c5fd',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#f97316',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#0d1b40',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Cairo-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 90,
    paddingLeft: 16,
  },
  dropdown: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    transformOrigin: 'top left',
  },
  dropBrand: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  dropLogoWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dropLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  dropAppName: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#fff',
    letterSpacing: 2,
  },
  dropAppSub: {
    fontSize: 9,
    fontFamily: 'Cairo-Regular',
    color: '#93c5fd',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  dropUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  dropAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropInitials: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
  },
  dropUserInfo: {
    flex: 1,
  },
  dropUserName: {
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
    color: '#1e293b',
    textAlign: 'left',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: 'Cairo-Bold',
    color: '#2563eb',
  },
  menuItems: {
    padding: 10,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  menuItemDanger: {
    backgroundColor: '#fff5f5',
  },
  menuItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
    color: '#334155',
    textAlign: 'left',
  },
  dropFooter: {
    textAlign: 'center',
    fontSize: 9,
    fontFamily: 'Cairo-Regular',
    color: '#cbd5e1',
    paddingBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
