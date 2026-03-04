import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { toast } from 'sonner';

/**
 * Hook to automatically display toast notifications for new system notifications
 * Shows a beautiful popup when a new notification arrives
 */
export function useNotificationToast() {
    const { notifications, unreadCount } = useNotifications();
    const previousUnreadCount = useRef<number>(0);
    const shownNotificationIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        // Skip on initial mount
        if (previousUnreadCount.current === 0 && unreadCount > 0) {
            previousUnreadCount.current = unreadCount;
            // Mark all current notifications as "shown" to avoid spam on first load
            notifications?.forEach(n => {
                if (!n.is_read) {
                    shownNotificationIds.current.add(n.id);
                }
            });
            return;
        }

        // Check for new unread notifications
        if (unreadCount > previousUnreadCount.current) {
            const newNotifications = notifications?.filter(
                n => !n.is_read && !shownNotificationIds.current.has(n.id)
            ) || [];

            // Show toast for each new notification
            newNotifications.forEach(notification => {
                shownNotificationIds.current.add(notification.id);

                // Determine toast type based on notification type
                let toastFn = toast.info;
                if (notification.type === 'NEW_APPOINTMENT' || notification.priority === 'HIGH') {
                    toastFn = toast.success;
                } else if (notification.type === 'APPOINTMENT_CANCELLED') {
                    toastFn = toast.error;
                } else if (notification.type === 'APPOINTMENT_COMPLETED') {
                    toastFn = toast.success;
                }

                toastFn(notification.title, {
                    description: notification.message,
                    duration: 5000,
                    position: 'bottom-left',
                    icon: getNotificationIcon(notification.type),
                });
            });
        }

        previousUnreadCount.current = unreadCount;
    }, [notifications, unreadCount]);
}

/**
 * Get appropriate emoji icon for notification type
 */
function getNotificationIcon(type: string): string {
    switch (type) {
        case 'NEW_APPOINTMENT':
            return '📅';
        case 'NEW_PATIENT':
            return '👤';
        case 'APPOINTMENT_CANCELLED':
            return '🚫';
        case 'APPOINTMENT_COMPLETED':
            return '✅';
        default:
            return '🔔';
    }
}
