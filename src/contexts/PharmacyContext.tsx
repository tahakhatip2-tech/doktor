import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface PharmacyUser {
    id: number;
    email: string;
    role: string;
    name?: string;
    avatar?: string;
    phone?: string;
    clinic_name?: string;
    clinic_address?: string;
    clinic_phone?: string;
    clinic_specialty?: string;
    working_hours?: string;
    [key: string]: unknown;
}

interface PharmacyContextValue {
    pharmacy: PharmacyUser | null;
    loading: boolean;
    signOut: () => void;
    setPharmacy: (p: PharmacyUser | null) => void;
    refresh: () => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextValue | null>(null);

const readStoredPharmacy = (): PharmacyUser | null => {
    try { return JSON.parse(localStorage.getItem('pharmacy_user') || 'null') as PharmacyUser | null; }
    catch { return null; }
};

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [pharmacy, setPharmacyState] = useState<PharmacyUser | null>(readStoredPharmacy);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('pharmacy_token');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/pharmacy/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (cancelled) return;
                if (res.data?.role !== 'PHARMACY') throw new Error('Not a pharmacy');
                const data = res.data as PharmacyUser;
                setPharmacyState(data);
                localStorage.setItem('pharmacy_user', JSON.stringify(data));
            } catch (err) {
                if (cancelled) return;
                console.error('Pharmacy profile fetch failed:', err);
                localStorage.removeItem('pharmacy_token');
                localStorage.removeItem('pharmacy_user');
                setPharmacyState(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchProfile();
        return () => { cancelled = true; };
    }, [token]);

    const setPharmacy = useCallback((p: PharmacyUser | null) => {
        setPharmacyState(p);
        if (p) localStorage.setItem('pharmacy_user', JSON.stringify(p));
    }, []);

    const refresh = useCallback(async () => {
        const t = localStorage.getItem('pharmacy_token');
        if (!t) return;
        try {
            const res = await axios.get(`${API_URL}/pharmacy/profile`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (res.data?.role !== 'PHARMACY') throw new Error('Not a pharmacy');
            setPharmacy(res.data as PharmacyUser);
        } catch (err) {
            console.error('Pharmacy refresh failed:', err);
        }
    }, [setPharmacy]);

    const signOut = useCallback(() => {
        localStorage.removeItem('pharmacy_token');
        localStorage.removeItem('pharmacy_user');
        setPharmacyState(null);
        navigate('/unified-auth', { replace: true });
    }, [navigate]);

    return (
        <PharmacyContext.Provider value={{ pharmacy, loading, signOut, setPharmacy, refresh }}>
            {children}
        </PharmacyContext.Provider>
    );
}

export function usePharmacy() {
    const ctx = useContext(PharmacyContext);
    if (!ctx) throw new Error('usePharmacy must be used within PharmacyProvider');
    return ctx;
}
