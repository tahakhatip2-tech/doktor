import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

// إعداد كيفية ظهور الإشعارات أثناء فتح التطبيق
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * الحصول على Expo Push Token وإرساله للخادم
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  // لا يعمل في Expo Go
  if (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient'
  ) {
    console.warn('Push notifications not supported in Expo Go');
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.warn('Push token error:', e);
  }

  return token;
}

/**
 * إرسال push token للخادم بعد تسجيل الدخول
 * يُستدعى من loginAsPatient / loginAsDoctor
 */
export async function syncPushTokenWithServer(
  userType: 'patient' | 'doctor' | 'pharmacy'
): Promise<void> {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    const endpoint =
      userType === 'patient'
        ? '/patient/push-token'
        : userType === 'doctor'
        ? '/push-token'
        : '/pharmacy/push-token';

    await apiClient.post(endpoint, { pushToken: token, platform: Platform.OS });
  } catch (e) {
    // لا نوقف التطبيق إذا فشل ربط التوكن
    console.warn('Failed to sync push token:', e);
  }
}

/**
 * التوجيه الصحيح عند الضغط على إشعار
 * يُستدعى من _layout.tsx الرئيسي
 */
export function getNotificationRoute(
  notification: Notifications.Notification,
  userType: 'patient' | 'doctor' | 'pharmacy'
): string | null {
  const data = notification.request.content.data as any;

  if (!data) return null;

  if (userType === 'patient') {
    if (data.type === 'appointment_status' || data.type === 'appointment_reminder') {
      return data.appointmentId
        ? `/(patient)/appointments/${data.appointmentId}`
        : '/(patient)/appointments';
    }
    if (data.type === 'new_message') {
      return data.clinicId
        ? `/(patient)/chat/${data.clinicId}`
        : '/(patient)/chat';
    }
    if (data.type === 'offer') return '/(patient)/offers';
  }

  if (userType === 'doctor') {
    if (data.type === 'new_appointment') {
      return data.appointmentId
        ? `/(doctor)/appointments/${data.appointmentId}`
        : '/(doctor)/appointments';
    }
  }

  if (userType === 'pharmacy') {
    if (data.type === 'new_prescription') {
      return data.prescriptionId
        ? `/(pharmacy)/prescriptions/${data.prescriptionId}`
        : '/(pharmacy)/prescriptions';
    }
  }

  return null;
}
