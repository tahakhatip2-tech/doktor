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
            setNotifications(response.data);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">الإشعارات</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead}>
                        <Check className="h-4 w-4 ml-2" />
                        تحديد الكل كمقروء
                    </Button>
                )}
            </div>

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
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`shadow-card hover:shadow-md transition-all cursor-pointer ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
                            onClick={() => !notification.isRead && markAsRead(notification.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${!notification.isRead ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="font-semibold">{notification.title}</h4>
                                            {!notification.isRead && (
                                                <Badge variant="default" className="flex-shrink-0">جديد</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(notification.createdAt), 'PPp', { locale: ar })}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
