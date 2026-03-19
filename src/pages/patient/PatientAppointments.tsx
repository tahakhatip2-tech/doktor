import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, FileText, X, Loader2, Eye } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import PatientHero from '@/components/patient/PatientHero';
import { buildAppointmentUrl } from '@/lib/slug';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientAppointments() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState('all');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            const response = await axios.get(`${API_URL}/patient/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedAppointments = Array.isArray(response.data)
                ? response.data
                : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
            setAppointments(fetchedAppointments);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'حدث خطأ أثناء تحميل المواعيد',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment) return;
        setCancelLoading(true);
        try {
            const token = localStorage.getItem('patient_token');
            await axios.delete(`${API_URL}/patient/appointments/${selectedAppointment.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { reason: 'تم الإلغاء من قبل المريض' },
            });
            toast({ title: 'تم إلغاء الموعد', description: 'تم إلغاء الموعد بنجاح' });
            fetchAppointments();
            setCancelDialogOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: error.response?.data?.message || 'حدث خطأ أثناء إلغاء الموعد',
            });
        } finally {
            setCancelLoading(false);
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

    const filterAppointments = (status?: string) => {
        if (!status || status === 'all') return appointments;
        return appointments.filter((apt) => apt.status === status);
    };

    const filteredAppointments = filterAppointments(selectedTab);

    return (
        <div className="space-y-6 animate-fade-in">
            <PatientHero
                showBackButton={true}
                title="مواعيدي الطبية"
                subtitle="إدارة ومتابعة حجوزاتك"
                description="تابع مواعيدك مع نخبة من أفضل الأطباء بكل سهولة."
                badgeText="مواعيد منظمة"
            />

            <div className="px-4 sm:px-0 space-y-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">الكل</TabsTrigger>
                        <TabsTrigger value="pending">في الانتظار</TabsTrigger>
                        <TabsTrigger value="confirmed">مؤكدة</TabsTrigger>
                        <TabsTrigger value="completed">مكتملة</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedTab} className="mt-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
                            </div>
                        ) : filteredAppointments.length === 0 ? (
                            <Card className="shadow-card">
                                <CardContent className="py-12 text-center">
                                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">لا توجد مواعيد</h3>
                                    <p className="text-muted-foreground">
                                        {selectedTab === 'all'
                                            ? 'لم تقم بحجز أي مواعيد بعد'
                                            : `لا توجد مواعيد ${selectedTab === 'pending' ? 'في الانتظار' : selectedTab === 'confirmed' ? 'مؤكدة' : 'مكتملة'}`}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {filteredAppointments.map((appointment) => (
                                    <Card key={appointment.id} className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                                        {/* ── Header ───────────────── */}
                                        <div className="flex items-start justify-between p-5 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full blur-[4px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative h-14 w-14 rounded-full bg-white p-0.5 z-10 flex items-center justify-center">
                                                        <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center overflow-hidden border border-white text-blue-800 font-bold text-lg">
                                                            {appointment.user?.name?.[0] || 'د'}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-extrabold text-base text-slate-900 truncate">
                                                            {appointment.user?.name || appointment.user?.clinic_name}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                        <p className="text-xs text-orange-600 font-bold flex items-center gap-1.5 truncate bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100">
                                                            <span>{appointment.user?.clinic_specialty || 'عيادة طبية'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col items-end pt-1">
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                        </div>

                                        {/* ── Content ───────────── */}
                                        <div className="px-5 pb-5 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                    <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                    <span>{format(new Date(appointment.appointmentDate), 'PPP', { locale: ar })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                    <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                                    <span>{format(new Date(appointment.appointmentDate), 'p', { locale: ar })}</span>
                                                </div>
                                                {appointment.user?.clinic_address && (
                                                    <div className="flex items-start gap-2 text-sm text-slate-600 font-medium sm:col-span-2">
                                                        <MapPin className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span>{appointment.user.clinic_address}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {appointment.notes && (
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                                                    <div className="flex items-start gap-2 text-sm text-slate-600">
                                                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                                        <div>
                                                            <p className="font-bold text-slate-800 mb-0.5">ملاحظات الموعد:</p>
                                                            <p className="text-slate-600 leading-relaxed">{appointment.notes}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Bottom Action Bar ───────────────────────────────── */}
                                        <div className="flex items-center gap-1.5 px-3 py-3 bg-slate-50 border-t border-slate-200">
                                            {/* 👁️ View Detail button — always visible */}
                                            <button
                                                onClick={() => navigate(
                                                    buildAppointmentUrl(
                                                        appointment.id,
                                                        appointment.user?.name || appointment.user?.clinic_name || 'doctor',
                                                        appointment.appointmentDate
                                                    )
                                                )}
                                                className="flex-[2] flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                عرض التفاصيل
                                            </button>

                                            {/* Cancel button — only for pending/confirmed */}
                                            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                                <button
                                                    onClick={() => { setSelectedAppointment(appointment); setCancelDialogOpen(true); }}
                                                    className="flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300 bg-white text-red-600 border border-red-200 hover:bg-red-50 shadow-sm"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    إلغاء
                                                </button>
                                            )}
                                        </div>

                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الإلغاء</AlertDialogTitle>
                            <AlertDialogDescription>
                                هل أنت متأكد من إلغاء هذا الموعد؟ لن تتمكن من التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={cancelLoading}>إغلاق</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleCancelAppointment}
                                disabled={cancelLoading}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {cancelLoading ? (
                                    <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الإلغاء...</>
                                ) : 'تأكيد الإلغاء'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

