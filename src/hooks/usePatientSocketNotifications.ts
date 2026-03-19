import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { usePatientAuth } from './usePatientAuth';

/**
 * Hook لإدارة الإشعارات Real-time للمريض عبر Socket.io
 * يتصل تلقائياً عند تسجيل دخول المريض
 * يستمع لحدث 'patient_notification' ويعرض Toast فورياً
 */
export function usePatientSocketNotifications(onNewNotification?: () => void, onNewMessage?: () => void) {
    const { patient, token } = usePatientAuth(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!patient || !token || socketRef.current) return;

        let socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        socketUrl = socketUrl.replace(/\/api$/, '');

        console.log('[PatientSocket] Connecting to:', socketUrl, 'Patient:', patient.id);

        const socket = io(socketUrl, {
            query: {
                patientId: patient.id,
                type: 'patient',
            },
            auth: { token },
            transports: ['polling', 'websocket'],
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

        // الاستماع لإشعارات المريض العامة
        socket.on('patient_notification', (notification: any) => {
            console.log('[PatientSocket] New notification:', notification);
            showPatientToast(notification);
            playNotificationSound();
            if (onNewNotification) onNewNotification();
        });

        // ── رسائل الدردشة الداخلية للمريض ──
        socket.on('internal_message', (payload: any) => {
            console.log('[PatientSocket] New internal message:', payload);
            const content = payload?.message?.content;
            const senderType = payload?.message?.senderType;
            // عرض toast فقط إذا كانت الرسالة من الطبيب أو البوت
            if (senderType !== 'PATIENT') {
                toast.info('رسالة جديدة من العيادة', {
                    description: content ? content.substring(0, 80) : 'لديك رسالة جديدة',
                    duration: 6000,
                    position: 'bottom-right',
                    icon: '💬',
                });
                playNotificationSound();
            }
            if (onNewMessage) onNewMessage();
        });

        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                console.log('[PatientSocket] Disconnecting...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [patient, token, onNewNotification, onNewMessage]);
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
