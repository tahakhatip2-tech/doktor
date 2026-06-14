import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ActiveDoctor {
    id: number;
    name: string;
    role: string;
    specialty?: string | null;
    email?: string | null;
    phone?: string | null;
    clinicId: number;
    username?: string | null;
    hasLogin: boolean;
    avatar?: string | null;
    workingDays?: string | null;
    shiftTiming?: string | null;
    certifications?: string | null;
    experienceYears?: number | null;
}

interface ActiveDoctorContextType {
    activeDoctor: ActiveDoctor | null;       // null = صاحب العيادة (Admin)
    setActiveDoctor: (doc: ActiveDoctor | null) => void;
    showLoginModal: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    logout: () => void;                      // تسجيل خروج الطبيب (يعود للـ Admin)
}

const SESSION_KEY = 'clinic_active_doctor';

// ─── Context ──────────────────────────────────────────────────────────────────
const ActiveDoctorContext = createContext<ActiveDoctorContextType | undefined>(undefined);

export function ActiveDoctorProvider({ children }: { children: React.ReactNode }) {
    const [activeDoctor, setActiveDoctorState] = useState<ActiveDoctor | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // استعادة الجلسة من sessionStorage عند تحديث الصفحة
    useEffect(() => {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
            try {
                setActiveDoctorState(JSON.parse(stored));
            } catch {
                sessionStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    const setActiveDoctor = useCallback((doc: ActiveDoctor | null) => {
        setActiveDoctorState(doc);
        if (doc) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(doc));
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }, []);

    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

    const logout = useCallback(() => {
        setActiveDoctor(null);
        setShowLoginModal(true); // اعرض المودال مجدداً للاختيار
    }, [setActiveDoctor]);

    return (
        <ActiveDoctorContext.Provider value={{
            activeDoctor,
            setActiveDoctor,
            showLoginModal,
            openLoginModal,
            closeLoginModal,
            logout,
        }}>
            {children}
        </ActiveDoctorContext.Provider>
    );
}

export function useActiveDoctor() {
    const ctx = useContext(ActiveDoctorContext);
    if (!ctx) throw new Error('useActiveDoctor must be used inside ActiveDoctorProvider');
    return ctx;
}
