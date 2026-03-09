import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { usePatientAuth } from './usePatientAuth';

/**
 * Hook لإدارة الإشعارات Real-time للمريض عبر Socket.io
 * يتصل تلقائياً عند تسجيل دخول المريض
 * يستمع لحدث 'patient_notification' ويعرض Toast فورياً
 */
export function usePatientSocketNotifications(onNewNotification?: () => void) {
    const { patient, token } = usePatientAuth(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // اتصل فقط إذا كان المريض مسجل الدخول
        if (!patient || !token || socketRef.current) return;

        // تحديد URL الخادم
        let socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        socketUrl = socketUrl.replace(/\/api$/, ''); // إزالة /api

        console.log('[PatientSocket] Connecting to:', socketUrl, 'Patient:', patient.id);

        const socket = io(socketUrl, {
            query: {
                patientId: patient.id,
                type: 'patient',
            },
            auth: { token },
            transports: ['polling', 'websocket'], // البدء بـ polling للمزيد من الاستقرار مع ngrok
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true',
                'bypass-tunnel-reminder': 'true'
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
            console.log('[PatientSocket] Connected:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.warn('[PatientSocket] Connection error:', err.message);
        });

        // الاستماع لإشعارات المريض
        socket.on('patient_notification', (notification: any) => {
            console.log('[PatientSocket] New notification:', notification);
            showPatientToast(notification);

            // تشغيل صوت الإشعار
            playNotificationSound();

            // استدعاء callback لتحديث قائمة الإشعارات
            if (onNewNotification) {
                onNewNotification();
            }
        });

        socketRef.current = socket;

        // تنظيف عند إلغاء التثبيت
        return () => {
            if (socketRef.current) {
                console.log('[PatientSocket] Disconnecting...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [patient, token, onNewNotification]);
}

function showPatientToast(notification: any) {
    const type = notification.type || '';
    const title = notification.title || 'إشعار جديد';
    const message = notification.message || '';

    if (type === 'appointment_confirmed' || type === 'APPOINTMENT_CONFIRMED') {
        toast.success(title, {
            description: message,
            duration: 6000,
            position: 'bottom-right',
            icon: '✅',
        });
    } else if (type === 'appointment_cancelled' || type === 'APPOINTMENT_CANCELLED') {
        toast.error(title, {
            description: message,
            duration: 6000,
            position: 'bottom-right',
            icon: '❌',
        });
    } else if (type === 'appointment_created' || type === 'NEW_APPOINTMENT') {
        toast.info(title, {
            description: message,
            duration: 6000,
            position: 'bottom-right',
            icon: '📅',
        });
    } else {
        toast(title, {
            description: message,
            duration: 5000,
            position: 'bottom-right',
            icon: '🔔',
        });
    }
}

function playNotificationSound() {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {/* ignore autoplay restriction */ });
    } catch {
        // ignore
    }
}
