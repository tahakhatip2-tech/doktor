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
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Section */}
            <div className="gradient-primary rounded-lg p-6 text-white shadow-glow">
                <h1 className="text-3xl font-bold mb-2">مرحباً، {user?.fullName}!</h1>
                <p className="text-white/90">نتمنى لك صحة وعافية</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/patient/clinics">
                    <Card className="hover:shadow-glow transition-all cursor-pointer group">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Building2 className="h-6 w-6 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">تصفح العيادات</h3>
                                <p className="text-sm text-muted-foreground">ابحث عن عيادة</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/appointments">
                    <Card className="hover:shadow-glow transition-all cursor-pointer group">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent group-hover:text-white transition-colors">
                                <Calendar className="h-6 w-6 text-accent group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">مواعيدي</h3>
                                <p className="text-sm text-muted-foreground">إدارة المواعيد</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/patient/medical-records">
                    <Card className="hover:shadow-glow transition-all cursor-pointer group">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-success/10 group-hover:bg-success group-hover:text-white transition-colors">
                                <FileText className="h-6 w-6 text-success group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">السجلات الطبية</h3>
                                <p className="text-sm text-muted-foreground">عرض السجلات</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    المواعيد القادمة
                                </CardTitle>
                                <CardDescription>مواعيدك المجدولة</CardDescription>
                            </div>
                            <Link to="/patient/appointments">
                                <Button variant="ghost" size="sm">عرض الكل</Button>
                            </Link>
                        </div>
                    </CardHeader>
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
                            <div className="space-y-3">
                                {upcomingAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold">
                                                    {appointment.user?.clinic_name || appointment.user?.name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.user?.clinic_specialty}
                                                </p>
                                            </div>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(appointment.appointmentDate), 'PPP', { locale: ar })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(appointment.appointmentDate), 'p', { locale: ar })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-accent" />
                                    الإشعارات الأخيرة
                                </CardTitle>
                                <CardDescription>آخر التحديثات</CardDescription>
                            </div>
                            <Link to="/patient/notifications">
                                <Button variant="ghost" size="sm">عرض الكل</Button>
                            </Link>
                        </div>
                    </CardHeader>
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
                                        className={`p-3 border rounded-lg ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {format(new Date(notification.createdAt), 'PPp', { locale: ar })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
