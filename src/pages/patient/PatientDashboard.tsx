import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Building2, FileText, Bell, Plus } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import PatientHero from '@/components/patient/PatientHero';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function PatientDashboard() {
    const [loading, setLoading] = useState(true);
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('patient_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [appointmentsRes, notificationsRes] = await Promise.all([
                axios.get(`${API_URL}/patient/appointments/upcoming`, { headers }),
                axios.get(`${API_URL}/patient/notifications`, { headers }),
            ]);

            const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data :
                (appointmentsRes.data?.data && Array.isArray(appointmentsRes.data.data) ? appointmentsRes.data.data : []);
            const notifications = Array.isArray(notificationsRes.data) ? notificationsRes.data :
                (notificationsRes.data?.data && Array.isArray(notificationsRes.data.data) ? notificationsRes.data.data : []);

            setUpcomingAppointments(appointments.slice(0, 3));
            setNotifications(notifications.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: any }> = {
            pending: { label: 'في الانتظار', variant: 'secondary' },
            confirmed: { label: 'مؤكد', variant: 'default' },
            completed: { label: 'مكتمل', variant: 'outline' },
            cancelled: { label: 'ملغي', variant: 'destructive' },
        };
        const config = statusMap[status] || { label: status, variant: 'secondary' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-8">
            {/* Elegant Hero Section */}
            <PatientHero
                title={`مرحباً بك، ${user?.fullName || ''}`}
                subtitle="في تطبيق Doctor Jo"
                description="نحن هنا لنقدم لك ولعائلتك أفضل رعاية طبية لتنعموا بحياة صحية وسعيدة."
                badgeText="دائماً في خدمتك"
            />

            <div className="px-4 sm:px-0 flex flex-col gap-6 -mt-4 relative z-20">
                {/* Upcoming Appointments */}
                <Card className="relative rounded-2xl border border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group/card">
                    <div className="p-3 sm:p-4 border-b border-orange-50/50 flex items-center justify-between gap-2 bg-gradient-to-b from-orange-50/30 to-transparent">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-orange-50 text-orange-500 shadow-sm border border-orange-100">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-blue-950 tracking-tight">المواعيد القادمة</h3>
                        </div>
                        <Link to="/patient/appointments" className="shrink-0">
                            <Button variant="ghost" size="sm" className="font-bold text-xs sm:text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl px-2 sm:px-4 hidden sm:flex">
                                عرض الكل
                            </Button>
                        </Link>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <div className="text-center py-6 flex flex-col items-center justify-center">
                                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-3 border border-blue-100">
                                    <Calendar className="h-6 w-6 text-blue-300" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700 mb-1">لا توجد مواعيد قادمة</h4>
                                <Link to="/patient/clinics">
                                    <Button size="sm" className="rounded-xl mt-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md font-bold text-[10px]">
                                        <Plus className="h-3 w-3 ml-1" />
                                        احجز موعد
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="relative rounded-xl border border-blue-100/50 bg-white p-3 sm:p-4 hover:border-blue-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all duration-300 group/item flex flex-col gap-3"
                                    >
                                        <div className="flex items-start justify-between gap-1">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover/item:text-blue-600 transition-colors truncate">
                                                    {appointment.user?.clinic_name || appointment.user?.name}
                                                </h4>
                                                <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[9px] font-bold border border-orange-100">
                                                    {appointment.user?.clinic_specialty || 'عيادة طبية'}
                                                </div>
                                            </div>
                                            <div className="shrink-0 scale-75 origin-top-left -mt-1 -ml-2 sm:scale-90">
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-slate-50/80 p-2 sm:p-2.5 rounded-lg border border-slate-100/50">
                                            <div className="flex items-center gap-1.5 flex-1 sm:flex-none justify-center sm:justify-start">
                                                <div className="p-1 bg-blue-100/50 rounded flex items-center justify-center">
                                                    <Calendar className="h-3 w-3 text-blue-600" />
                                                </div>
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{format(new Date(appointment.appointmentDate), 'PPP', { locale: ar })}</span>
                                            </div>
                                            <div className="w-px h-3 bg-slate-200 hidden sm:block"></div>
                                            <div className="flex items-center gap-1.5 flex-1 sm:flex-none justify-center sm:justify-start border-r border-slate-200 sm:border-0">
                                                <div className="p-1 bg-orange-100/50 rounded flex items-center justify-center">
                                                    <Clock className="h-3 w-3 text-orange-600" />
                                                </div>
                                                <span dir="ltr" className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{format(new Date(appointment.appointmentDate), 'p', { locale: ar })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {upcomingAppointments.length > 0 && (
                            <Link to="/patient/appointments" className="sm:hidden block mt-3">
                                <Button variant="outline" size="sm" className="w-full rounded-xl border-blue-200 text-blue-600 font-bold text-[11px] hover:bg-blue-50">
                                    عرض كل المواعيد
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card className="relative rounded-2xl border border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group/card lg:mt-0">
                    <div className="p-3 sm:p-4 border-b border-orange-50/50 flex items-center justify-between gap-2 bg-gradient-to-b from-orange-50/30 to-transparent">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-orange-50 text-orange-500 shadow-sm border border-orange-100">
                                <Bell className="h-5 w-5" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-blue-950 tracking-tight">آخر الإشعارات</h3>
                        </div>
                        <Link to="/patient/notifications" className="shrink-0">
                            <Button variant="ghost" size="sm" className="font-bold text-xs sm:text-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl px-2 sm:px-4 hidden sm:flex">
                                عرض الكل
                            </Button>
                        </Link>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-6 flex flex-col items-center justify-center">
                                <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                                    <Bell className="h-6 w-6 text-slate-300" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700 mb-1">لا توجد إشعارات</h4>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "relative p-3 sm:p-4 rounded-xl border transition-all duration-300 group/notif flex items-start gap-2 sm:gap-3",
                                            !notification.isRead 
                                                ? "bg-gradient-to-l from-orange-50/80 to-transparent border-orange-200 shadow-sm" 
                                                : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                                        )}
                                    >
                                        {!notification.isRead && (
                                            <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-500 rounded-r-xl"></div>
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <h4 className="font-extrabold text-[13px] sm:text-sm text-slate-900 group-hover/notif:text-orange-600 transition-colors truncate">
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="shrink-0 flex h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-[11px] sm:text-xs font-medium text-slate-600 leading-snug mb-2 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-end border-t border-slate-100 pt-2">
                                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                                                    {format(new Date(notification.createdAt), 'PPp', { locale: ar })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {notifications.length > 0 && (
                            <Link to="/patient/notifications" className="sm:hidden block mt-3">
                                <Button variant="outline" size="sm" className="w-full rounded-xl border-orange-200 text-orange-600 font-bold text-[11px] hover:bg-orange-50">
                                    كل الإشعارات
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}

