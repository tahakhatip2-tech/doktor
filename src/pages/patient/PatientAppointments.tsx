import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Calendar, Clock, MapPin, FileText, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientAppointments() {
    const { toast } = useToast();
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
            <div>
                <h1 className="text-3xl font-bold mb-2">مواعيدي</h1>
                <p className="text-muted-foreground">إدارة مواعيدك الطبية</p>
            </div>

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
                                <Card key={appointment.id} className="shadow-card hover:shadow-glow transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">
                                                    {appointment.user?.clinic_name || appointment.user?.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {appointment.user?.clinic_specialty}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span>{format(new Date(appointment.appointmentDate), 'PPP', { locale: ar })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-primary" />
                                                <span>{format(new Date(appointment.appointmentDate), 'p', { locale: ar })}</span>
                                            </div>
                                            {appointment.user?.clinic_address && (
                                                <div className="flex items-start gap-2 text-sm md:col-span-2">
                                                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                                    <span>{appointment.user.clinic_address}</span>
                                                </div>
                                            )}
                                        </div>

                                        {appointment.notes && (
                                            <div className="bg-muted/50 p-3 rounded-lg">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="font-medium mb-1">ملاحظات:</p>
                                                        <p className="text-muted-foreground">{appointment.notes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => { setSelectedAppointment(appointment); setCancelDialogOpen(true); }}
                                                >
                                                    <X className="h-4 w-4 ml-2" />
                                                    إلغاء الموعد
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
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
    );
}

