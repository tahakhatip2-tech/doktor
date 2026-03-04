import React, { createContext, useContext, useState, useEffect } from 'react';
import { whatsappApi, BASE_URL } from '@/lib/api';

interface ClinicSettings {
    clinic_name: string;
    clinic_description: string;
    clinic_logo: string;
    doctor_name: string;
    phone: string;
    emergency_phone: string;
    address: string;
    working_hours_start: string;
    working_hours_end: string;
    appointment_duration: number;
    auto_reply_enabled: boolean;
    reminder_enabled: boolean;
    reminder_time: number;
}

interface ClinicContextType {
    settings: ClinicSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const data = await whatsappApi.getSettings();
            if (data) {
                // Ensure correct types and full URLs for logic if needed (though components might handle URL prefixes)
                // We keep raw data mostly, but handle booleans if they come as strings '1'/'0'
                const formattedSettings = {
                    ...data,
                    // Handle various string representations from backend
                    clinic_name: data.clinic_name || '',
                    clinic_description: data.clinic_description || '',
                    clinic_logo: data.clinic_logo || '',
                    auto_reply_enabled: data.ai_enabled === '1' || data.auto_reply_enabled === '1' || data.auto_reply_enabled === true || data.auto_reply_enabled === 'true',
                    reminder_enabled: data.reminder_enabled === '1' || data.reminder_enabled === true || data.reminder_enabled === 'true',
                    appointment_duration: parseInt(data.appointment_duration) || 30,
                    reminder_time: parseInt(data.reminder_time) || 60,
                    ai_enabled: data.ai_enabled === '1' || data.ai_enabled === true || data.ai_enabled === 'true',
                };
                setSettings(formattedSettings);
            }
        } catch (error) {
            console.error('Failed to fetch clinic settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <ClinicContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </ClinicContext.Provider>
    );
}

export function useClinicContext() {
    const context = useContext(ClinicContext);
    if (context === undefined) {
        throw new Error('useClinicContext must be used within a ClinicProvider');
    }
    return context;
}
