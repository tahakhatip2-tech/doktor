import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
    Calendar, Clock, MapPin, Phone, Building2,
    FileText, X, Loader2, ArrowRight, CheckCircle2,
    AlertCircle, User, Stethoscope, ClipboardList
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BASE_URL } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Status config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    pending:   { label: 'في الانتظار',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: Clock },
    confirmed: { label: 'مؤكد',         color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: CheckCircle2 },
    completed: { label: 'مكتمل',        color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle2 },
    cancelled: { label: 'ملغي',         color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: X },
};

export default function AppointmentDetail() {
    const { id } = useParams<{ id: string; slug?: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchAppointment();
    }, [id]);

    const fetchAppointment = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            if (!token) { navigate('/unified-auth'); return; }
            const res = await axios.get(`${API_URL}/patient/appointments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true',
                },
            });
            setAppointment(res.data);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على الموعد' });
            navigate('/patient/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!appointment) return;
        setCancelLoading(true);
        try {
            const token = localStorage.getItem('patient_token');
            await axios.delete(`${API_URL}/patient/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { reason: 'تم الإلغاء من قبل المريض' },
            });
            toast({ title: '✅ تم إلغاء الموعد', description: 'تم إلغاء موعدك بنجاح.' });
            setCancelOpen(false);
            fetchAppointment(); // refresh status
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err.response?.data?.message || 'حدث خطأ أثناء الإلغاء' });
        } finally {
            setCancelLoading(false);
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] p-4 pb-24" dir="rtl">
                <div className="max-w-2xl mx-auto space-y-4 pt-4">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!appointment) return null;

    const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG['pending'];
    const StatusIcon = status.icon;
    const clinicName = appointment.user?.clinic_name || appointment.user?.name || 'العيادة';
    const doctorName = appointment.user?.name || 'الطبيب';
    const specialty = appointment.user?.clinic_specialty || '';
    const address = appointment.user?.clinic_address || '';
    const phone = appointment.user?.clinic_phone || '';
    const apptDate = new Date(appointment.appointmentDate);
    const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';
    const clinicId = appointment.user?.id;

    // avatar
    const avatarUrl = appointment.user?.avatar
        ? (appointment.user.avatar.startsWith('http') ? appointment.user.avatar : `${BASE_URL}${appointment.user.avatar.startsWith('/') ? '' : '/'}${appointment.user.avatar}`)
        : null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24" dir="rtl">

            {/* ── Top accent bar */}
            <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500" />

            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* ── Back button */}
                <button
                    onClick={() => navigate('/patient/appointments')}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <ArrowRight className="h-4 w-4" />
                    العودة إلى مواعيدي
                </button>

                {/* ── Status banner */}
                <div className={cn(
                    'flex items-center gap-3 p-4 rounded-2xl border font-bold',
                    status.bg, status.border, status.color
                )}>
                    <StatusIcon className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="text-xs opacity-70 mb-0.5">حالة الموعد</p>
                        <p className="text-base">{status.label}</p>
                    </div>
                    <div className="mr-auto text-left" dir="ltr">
                        <p className="text-xs opacity-70 mb-0.5">رقم الحجز</p>
                        <p className="text-base font-black">#{appointment.id}</p>
                    </div>
                </div>

                {/* ── Doctor & Clinic card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_20px_rgba(37,99,235,0.06)] overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-600 to-orange-400" />
                    <div className="p-5">
                        <div className="flex items-center gap-4 mb-5">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-0.5 bg-gradient-to-tr from-orange-400 to-blue-600 rounded-full blur opacity-50" />
                                <div className="relative h-16 w-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={doctorName} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="font-black text-2xl text-blue-700">{doctorName.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                                    <User className="h-3 w-3" /> الطبيب
                                </p>
                                <p className="font-black text-lg text-slate-900 leading-tight">{doctorName}</p>
                                {specialty && (
                                    <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                                        {specialty}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Clinic name */}
                        {clinicName !== doctorName && (
                            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                                <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">العيادة</p>
                                    <p className="text-sm font-bold text-slate-800">{clinicName}</p>
                                </div>
                            </div>
                        )}

                        {/* Address */}
                        {address && (
                            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                                <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">العنوان</p>
                                    <p className="text-sm font-bold text-slate-800">{address}</p>
                                </div>
                            </div>
                        )}

                        {/* Phone */}
                        {phone && (
                            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">هاتف العيادة</p>
                                    <a href={`tel:${phone}`} className="text-sm font-bold text-blue-600" dir="ltr">{phone}</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Appointment date & time */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_20px_rgba(37,99,235,0.06)] overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-500" />
                    <div className="p-5">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> تفاصيل الموعد
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">التاريخ</p>
                                <p className="text-sm font-black text-blue-800">
                                    {format(apptDate, 'dd MMMM yyyy', { locale: ar })}
                                </p>
                                <p className="text-xs text-blue-600 font-medium mt-0.5">
                                    {format(apptDate, 'EEEE', { locale: ar })}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-center">
                                <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                                <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">الوقت</p>
                                <p className="text-sm font-black text-orange-700">
                                    {format(apptDate, 'hh:mm a', { locale: ar })}
                                </p>
                                <p className="text-xs text-orange-500 font-medium mt-0.5">
                                    مدة {appointment.duration || 30} دقيقة
                                </p>
                            </div>
                        </div>

                        {/* Appointment type */}
                        {appointment.customerName && (
                            <div className="mt-3 flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">اسم المريض</p>
                                    <p className="text-sm font-bold text-slate-800">{appointment.customerName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Notes */}
                {appointment.notes && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_20px_rgba(37,99,235,0.06)] overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-purple-400 to-purple-500" />
                        <div className="p-5">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" /> ملاحظات الموعد
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                {appointment.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Medical Records (if any) */}
                {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_20px_rgba(37,99,235,0.06)] overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-500" />
                        <div className="p-5">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Stethoscope className="h-3.5 w-3.5" /> السجلات الطبية
                            </p>
                            <div className="space-y-3">
                                {appointment.medicalRecords.map((rec: any) => (
                                    <div key={rec.id} className="p-3 bg-green-50 rounded-xl border border-green-100 space-y-2">
                                        {rec.diagnosis && (
                                            <div>
                                                <p className="text-[9px] font-black text-green-500 uppercase tracking-wider">التشخيص</p>
                                                <p className="text-sm font-bold text-slate-800 mt-0.5">{rec.diagnosis}</p>
                                            </div>
                                        )}
                                        {rec.treatment && (
                                            <div>
                                                <p className="text-[9px] font-black text-green-500 uppercase tracking-wider">العلاج</p>
                                                <p className="text-sm text-slate-700 mt-0.5">{rec.treatment}</p>
                                            </div>
                                        )}
                                        {rec.aiAdvice && (
                                            <div className="bg-white p-2.5 rounded-lg border border-green-200">
                                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider mb-1">
                                                    🤖 نصيحة الذكاء الاصطناعي
                                                </p>
                                                <p className="text-xs text-slate-600 leading-relaxed">{rec.aiAdvice}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Cancellation info (if cancelled) */}
                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-black text-red-700 mb-0.5">سبب الإلغاء</p>
                                <p className="text-sm text-red-600">{appointment.cancellationReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                    {/* View clinic button */}
                    {clinicId && (
                        <Button
                            variant="outline"
                            className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 font-bold gap-2"
                            onClick={() => navigate(`/patient/clinics/${clinicId}`)}
                        >
                            <Building2 className="h-4 w-4" />
                            صفحة العيادة
                        </Button>
                    )}

                    {/* Cancel button */}
                    {canCancel && (
                        <Button
                            variant="outline"
                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold gap-2"
                            onClick={() => setCancelOpen(true)}
                        >
                            <X className="h-4 w-4" />
                            إلغاء الموعد
                        </Button>
                    )}

                    {/* Book another appointment */}
                    {(appointment.status === 'cancelled' || appointment.status === 'completed') && clinicId && (
                        <Button
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold gap-2 col-span-2"
                            onClick={() => navigate(`/patient/clinics/${clinicId}`)}
                        >
                            <Calendar className="h-4 w-4" />
                            احجز موعداً جديداً
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Cancel confirmation dialog */}
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <X className="h-5 w-5 text-red-500" />
                            تأكيد إلغاء الموعد
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من إلغاء هذا الموعد مع <strong>{clinicName}</strong> يوم{' '}
                            <strong>{format(apptDate, 'dd MMMM', { locale: ar })}</strong>؟
                            لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelLoading}>إغلاق</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
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
