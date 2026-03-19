import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ─── للطبيب ───────────────────────────────────────────────────────────────────
export function useDoctorUnreadMessages() {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token) return;
            const { data } = await axios.get(`${API_URL}/internal-chat/unread-count`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // الباكند يعيد number مباشرة
            setUnreadCount(typeof data === 'number' ? data : (data?.count ?? 0));
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchCount();
        // تحديث دوري كل 30 ثانية
        const interval = setInterval(fetchCount, 30_000);
        return () => clearInterval(interval);
    }, [fetchCount]);

    return { unreadCount, setUnreadCount, refetch: fetchCount };
}

// ─── للمريض ───────────────────────────────────────────────────────────────────
export function usePatientUnreadMessages() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [lastConversationId, setLastConversationId] = useState<number | null>(null);

    const fetchCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('patient_token');
            if (!token) return;

            // جلب عدد الرسائل غير المقروءة من endpoint مخصص (أسرع)
            const [countRes, convsRes] = await Promise.all([
                axios.get(`${API_URL}/patient/chat/unread-count`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/patient/chat/conversations`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const cnt = typeof countRes.data === 'number'
                ? countRes.data
                : (countRes.data?.count ?? 0);
            setUnreadCount(cnt);

            // إيجاد آخر محادثة برسالة غير مقروءة من الطبيب/البوت
            const convs: any[] = Array.isArray(convsRes.data) ? convsRes.data : [];
            let latestConvId: number | null = null;
            let latestTime = 0;
            convs.forEach(conv => {
                const lastMsg = conv.messages?.[0];
                if (lastMsg && lastMsg.senderType !== 'PATIENT' && lastMsg.isRead === false) {
                    const t = new Date(lastMsg.createdAt).getTime();
                    if (t > latestTime) {
                        latestTime = t;
                        latestConvId = conv.id;
                    }
                }
            });
            if (latestConvId) setLastConversationId(latestConvId);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30_000);
        return () => clearInterval(interval);
    }, [fetchCount]);

    return { unreadCount, setUnreadCount, lastConversationId, refetch: fetchCount };
}
