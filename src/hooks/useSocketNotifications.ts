import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

/**
 * Hook to manage real-time notifications via Socket.io
 * Automatically connects when user is logged in
 * Listens for 'notification' events and updates React Query cache + shows Toast
 */
export function useSocketNotifications(onNewMessage?: () => void) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only connect if user is logged in
        if (!user || !!socketRef.current) return;

        // Connect to NestJS WebSocket Gateway
        // Ensure this matches your backend URL. If using ngrok/proxy, adjust accordingly.
        // Assuming socket.io server is at the same origin as API or process.env.VITE_API_URL
        // Determine correct Socket URL
        let socketUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Clean up URL: remove '/api' suffix and ensure it points to the server root
        if (socketUrl.startsWith('/')) {
            // Probably a relative path (e.g., from generic proxy), explicitly point to backend port in dev
            // Or assume window.location.origin in production if not explicitly set
            socketUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:3000'
                : window.location.origin;
        } else {
            socketUrl = socketUrl.replace(/\/api$/, '');
        }

        console.log('Connecting to Socket.io at:', socketUrl, 'for User:', user.id);

        const socket = io(socketUrl, {
            query: {
                userId: user.id
            },
            transports: ['polling', 'websocket'], // البدء بـ polling للمزيد من الاستقرار مع ngrok
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true',
                'bypass-tunnel-reminder': 'true'
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket connected successfully:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        // Listen for real-time notifications
        socket.on('notification', (newNotification: any) => {
            console.log('Real-time notification received:', newNotification);

            // 1. Show Toast immediately
            showNotificationToast(newNotification);

            // 2. Play Sound (Optional - simplistic approach)
            playNotificationSound();

            // 3. Update React Query Cache (Optimistic UI Update)
            // Invalidate 'notifications' query so it refetches
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Also invalidate unread count
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        });

        // ── رسائل الدردشة الداخلية للطبيب ──
        socket.on('internal_message', (payload: any) => {
            console.log('[Doctor Socket] New internal message:', payload);
            const senderType = payload?.message?.senderType;
            
            let title = 'رسالة جديدة من مريض';
            let icon = '💬';

            if (senderType === 'BOT') {
                title = 'الموظف الذكي قام بالرد المتزامن';
                icon = '🤖';
            }

            // لا تظهر إشعار إذا كانت الرسالة من الطبيب نفسه
            if (senderType !== 'DOCTOR') {
                toast.info(title, {
                    description: payload?.message?.content
                        ? payload.message.content.substring(0, 80)
                        : 'لديك رسالة جديدة في الدردشة',
                    duration: 6000,
                    position: 'bottom-left',
                    icon: icon,
                });
                playNotificationSound();
            }
            if (onNewMessage) onNewMessage();
        });

        socketRef.current = socket;

        // Cleanup on unmount or user logout
        return () => {
            if (socketRef.current) {
                console.log('Disconnecting socket...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, queryClient, onNewMessage]);
}

function showNotificationToast(notification: any) {
    let toastFn = toast.info;
    let icon = '🔔';

    if (notification.type === 'NEW_APPOINTMENT' || notification.priority === 'HIGH') {
        toastFn = toast.success;
        icon = '📅';
    } else if (notification.type === 'NEW_PATIENT') {
        toastFn = toast.info;
        icon = '👤';
    } else if (notification.type === 'APPOINTMENT_CANCELLED') {
        toastFn = toast.error;
        icon = '🚫';
    } else if (notification.type === 'APPOINTMENT_COMPLETED') {
        toastFn = toast.success;
        icon = '✅';
    }

    toastFn(notification.title, {
        description: notification.message,
        duration: 5000,
        position: 'bottom-left',
        icon: icon,
    });
}

function playNotificationSound() {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5; // Set reasonable volume
        audio.play().catch(e => console.log('Audio play failed (interaction needed first):', e));
    } catch (e) {
        // ignore
    }
}
