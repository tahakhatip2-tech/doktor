import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── Types ──────────────────────────────────────────
interface PatientUser {
    id: number;
    email: string;
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    medicalHistory?: string;
}

interface PatientAuthState {
    patient: PatientUser | null;
    loading: boolean;
    token: string | null;
    isAuthenticated: boolean;
}

// ─── تحقق من انتهاء التوكن ──────────────────────────
function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1]));
        if (!payload.exp) return false;
        return Date.now() >= (payload.exp - 60) * 1000;
    } catch {
        return true;
    }
}

// ─── Hook ────────────────────────────────────────────
export const usePatientAuth = (requireAuth = false) => {
    const [state, setState] = useState<PatientAuthState>({
        patient: null,
        loading: true,
        token: null,
        isAuthenticated: false,
    });
    const navigate = useNavigate();

    const loadPatient = useCallback(() => {
        const token = localStorage.getItem('patient_token');
        const storedPatient = localStorage.getItem('patient_user');

        if (!token || !storedPatient) {
            setState({ patient: null, loading: false, token: null, isAuthenticated: false });
            if (requireAuth) navigate('/unified-auth');
            return;
        }

        // فحص انتهاء صلاحية التوكن
        if (isTokenExpired(token)) {
            console.warn('[usePatientAuth] Patient token expired, clearing session');
            localStorage.removeItem('patient_token');
            localStorage.removeItem('patient_user');
            setState({ patient: null, loading: false, token: null, isAuthenticated: false });
            if (requireAuth) {
                navigate('/unified-auth');
            }
            return;
        }

        try {
            const patient = JSON.parse(storedPatient);
            setState({
                patient,
                loading: false,
                token,
                isAuthenticated: true,
            });
        } catch {
            localStorage.removeItem('patient_user');
            setState({ patient: null, loading: false, token: null, isAuthenticated: false });
        }
    }, [navigate, requireAuth]);

    useEffect(() => {
        loadPatient();
    }, [loadPatient]);

    // ─── تسجيل الخروج ──────────────────────────────
    const signOut = useCallback(() => {
        localStorage.removeItem('patient_token');
        localStorage.removeItem('patient_user');
        setState({ patient: null, loading: false, token: null, isAuthenticated: false });
        navigate('/unified-auth');
    }, [navigate]);

    // ─── تحديث بيانات المريض ─────────────────────
    const updatePatient = useCallback(async (data: Partial<PatientUser>) => {
        const token = localStorage.getItem('patient_token');
        if (!token) return { error: 'غير مسجل الدخول' };

        try {
            const response = await axios.put(
                `${API_URL}/patient/profile`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedPatient = response.data;
            localStorage.setItem('patient_user', JSON.stringify(updatedPatient));
            setState(prev => ({ ...prev, patient: updatedPatient }));
            return { error: null };
        } catch (err: any) {
            return { error: err.response?.data?.message || 'فشل تحديث البيانات' };
        }
    }, []);

    // ─── إعادة تحميل بيانات المريض ───────────────
    const refresh = useCallback(() => {
        loadPatient();
    }, [loadPatient]);

    return {
        patient: state.patient,
        loading: state.loading,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        signOut,
        updatePatient,
        refresh,
    };
};
