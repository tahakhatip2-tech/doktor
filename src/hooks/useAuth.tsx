import { useEffect, useState, useCallback } from "react";
import { authApi } from "@/lib/api";
import { jwtDecode } from "jwt-decode";

// â”€â”€â”€ نظˆع المسطھخدم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: string;
  subscriptionStatus?: string;
  avatar?: string;
}

// â”€â”€â”€ الطھحقق من انطھهاط، صلاحظٹة الطھظˆظƒن â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;
    // ظٹطھحقق من الانطھهاط، مع هامش 60 ثانظٹة
    return Date.now() >= (decoded.exp - 60) * 1000;
  } catch {
    return true;
  }
}

// â”€â”€â”€ Hook الرئظٹسظٹ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      // الطھحقق من انطھهاط، صلاحظٹة الطھظˆظƒن
      if (isTokenExpired(token)) {
        console.warn('[useAuth] Token expired, clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser();
    setLoading(false);

    const handleUserUpdate = () => loadUser();
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, [loadUser]);

  // â”€â”€â”€ تسجيل حساب جدظٹد (طبيب) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const signUp = async (
    email: string,
    password: string,
    confirmPassword: string,
    name?: string,
    phone?: string
  ) => {
    // الطھحقق من طھطابق كلمة المرظˆر في الـ Frontend أظٹضاً
    if (password !== confirmPassword) {
      return { error: 'كلمة المرظˆر ظˆتأكيد كلمة المرظˆر غير مطھطابقظٹن' };
    }

    try {
      await authApi.register({ email, password, confirmPassword, name, phone });
      // تسجيل الدخظˆل الطھلقائظٹ بعد التسجيل
      return signIn(email, password);
    } catch (err: any) {
      return { error: err.message || 'حدث خطأ أثناء إنشاط، الحساب' };
    }
  };

  // â”€â”€â”€ تسجيل الدخظˆل â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password });
      const token = data.token || data.access_token;
      const userData = data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'البرظٹد الإلكطھرظˆنظٹ أظˆ كلمة المرظˆر غير صحظٹحة' };
    }
  };

  // â”€â”€â”€ تسجيل الخروج â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return { error: null };
  };

  // â”€â”€â”€ الطھحقق من الدظˆر â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isUser,
  };
};
