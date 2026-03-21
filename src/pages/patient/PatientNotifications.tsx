import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bell, Check, Trash2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import PatientHero from '@/components/patient/PatientHero';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientNotifications() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            const response = await axios.get(`${API_URL}/patient/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedNotifications = Array.isArray(response.data)
                ? response.data
                : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
            setNotifications(fetchedNotifications);
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء تحميل الإشعارات' });
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('patient_token');
            await axios.put(`${API_URL}/patient/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            await axios.put(`${API_URL}/patient/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            toast({ title: 'تم تحديث الإشعارات', description: 'تم تحديد جميع الإشعارات كمقروءة' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء تحديث الإشعارات' });
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            const token = localStorage.getItem('patient_token');
            await axios.delete(`${API_URL}/patient/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast({ title: 'تم الحذف', description: 'تم حذف الإشعار بنجاح' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء حذف الإشعار' });
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PatientHero
                showBackButton={true}
                title="الإشعارات"
                subtitle="كل ما يستجد حول صحتك"
                description={unreadCount > 0 ? `لديك ${unreadCount} تنبيهات غير مقروءة بانتظار مراجعتك.` : "جميع إشعاراتك مقروءة، أنت على اطلاع دائم."}
                badgeText={unreadCount > 0 ? `${unreadCount} إشعار جديد` : "لا توجد إشعارات جديدة"}
            >
                {unreadCount > 0 && (
                    <Button
                        variant="default"
                        onClick={markAllAsRead}
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xl backdrop-blur-md rounded-2xl h-11 px-6 font-bold"
                    >
                        <Check className="h-4 w-4 ml-2" />
                        تحديد الكل كمقروء
                    </Button>
                )}
            </PatientHero>

            <div className="px-4 sm:px-0 space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="shadow-card">
                        <CardContent className="py-12 text-center">
                            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                            <p className="text-muted-foreground">ستظهر الإشعارات هنا عند توفرها</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`relative rounded-2xl border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer group ${!notification.isRead ? 'border-orange-300 bg-orange-50/10' : 'border-blue-100 hover:border-orange-500'}`}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <div className="p-4 sm:p-5 flex items-start gap-4">
                                    <div className="relative">
                                        {!notification.isRead ? (
                                            <div className="relative h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm z-10 border border-orange-100">
                                                <Bell className="h-5 w-5 animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="relative h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:border-orange-100 border border-blue-100 transition-colors shadow-sm">
                                                <Bell className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <h4 className="font-extrabold text-base text-blue-950 group-hover:text-orange-600 transition-colors">{notification.title}</h4>
                                            {!notification.isRead && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-orange-100 text-orange-600 border border-orange-200">جديد</span>
                                                )}
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{notification.message}</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                                            <p className="text-[11px] font-bold text-slate-400">
                                                {format(new Date(notification.createdAt), 'PPp', { locale: ar })}
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                className="text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 h-8 px-3 rounded-xl gap-1.5 text-[10px] items-center font-bold transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span className="mt-0.5">حذف</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

