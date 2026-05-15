import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getPatientToken, getDoctorToken } from '../utils/storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============================
// Axios Instance الرئيسي
// ============================
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================
// Request Interceptor — إضافة التوكن تلقائياً
// ============================
apiClient.interceptors.request.use(
  async (config) => {
    // نحدد نوع التوكن بناءً على مسار الـ API
    const isPatientEndpoint = config.url?.startsWith('/patient/');

    let token: string | null = null;
    if (isPatientEndpoint) {
      token = await getPatientToken();
    } else {
      token = await getDoctorToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// Response Interceptor — معالجة الأخطاء
// ============================
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // يمكن إضافة منطق تسجيل الخروج التلقائي هنا
      console.warn('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// ============================
// مساعد لاستخراج رسالة الخطأ
// ============================
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'حدث خطأ غير متوقع'
    );
  }
  return 'حدث خطأ غير متوقع';
};
