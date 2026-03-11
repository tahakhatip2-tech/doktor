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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
            >
                {/* Dashboard Specific Quick Stats inside Hero */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white shadow-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">المواعيد القادمة</p>
                            <p className="text-2xl font-black">{upcomingAppointments.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-400" />
                        </div>
                    </div>
                </div>
            </PatientHero>

            {/* Quick Actions */}
            <div className="px-4 sm:px-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/patient/clinics">
                    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500"></div>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-orange-50 group-hover:bg-orange-500 transition-colors border border-orange-100 group-hover:border-orange-500 shadow-sm">
                                <Building2 className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900">تصفح العيادات</h3>
                                <p className="text-sm font-medium text-slate-500">ابحث عن عيادة</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/appointments">
                    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500"></div>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm">
                                <Calendar className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900">مواعيدي</h3>
                                <p className="text-sm font-medium text-slate-500">إدارة المواعيد</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/medical-records">
                    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500"></div>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-50 group-hover:bg-green-600 transition-colors border border-green-100 group-hover:border-green-600 shadow-sm">
                                <FileText className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900">السجلات الطبية</h3>
                                <p className="text-sm font-medium text-slate-500">عرض السجلات</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card className="relative rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-orange-500"></div>
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <span className="bg-blue-100 p-1.5 rounded-md">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </span>
                                المواعيد القادمة
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">مواعيدك الطبية المجدولة قريباً</p>
                        </div>
                        <Link to="/patient/appointments">
                            <Button variant="outline" size="sm" className="font-bold text-xs border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                                عرض الكل
                            </Button>
                        </Link>
                    </div>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : upcomingAppointments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد مواعيد قادمة</p>
                                <Link to="/patient/clinics">
                                    <Button className="mt-4" variant="outline">
                                        <Plus className="h-4 w-4 ml-2" />
                                        احجز موعد جديد
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="relative rounded-md border border-orange-500 bg-white p-4 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-blue-600"></div>
                                        <div className="flex items-start justify-between mb-3 pr-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-extrabold text-slate-900 truncate">
                                                    {appointment.user?.clinic_name || appointment.user?.name}
                                                </h4>
                                                <p className="text-xs text-orange-600 font-bold bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100 mt-1">
                                                    {appointment.user?.clinic_specialty || 'عيادة طبية'}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 pt-0.5">
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium bg-slate-50 p-2 rounded-md border border-slate-100 pr-2">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                <span>{format(new Date(appointment.appointmentDate), 'PPP', { locale: ar })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                                                <span dir="ltr">{format(new Date(appointment.appointmentDate), 'p', { locale: ar })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card className="relative rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-blue-600"></div>
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <span className="bg-orange-100 p-1.5 rounded-md">
                                    <Bell className="h-5 w-5 text-orange-600" />
                                </span>
                                الإشعارات الأخيرة
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">آخر التحديثات والتنبيهات</p>
                        </div>
                        <Link to="/patient/notifications">
                            <Button variant="outline" size="sm" className="font-bold text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                                عرض الكل
                            </Button>
                        </Link>
                    </div>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد إشعارات</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative p-4 border rounded-lg transition-all ${!notification.isRead ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                                    >
                                        {!notification.isRead && (
                                            <div className="absolute top-0 right-0 w-1 h-full bg-orange-500 rounded-r-lg"></div>
                                        )}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 pr-1">
                                                <h4 className="font-extrabold text-sm text-slate-800">{notification.title}</h4>
                                                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="h-2 w-2 rounded-full bg-orange-600 flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(234,88,12,0.6)] animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 mt-3 pt-3 border-t border-slate-200/50">
                                            {format(new Date(notification.createdAt), 'PPp', { locale: ar })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}

