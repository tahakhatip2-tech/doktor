import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    AlertCircle, User, Stethoscope, Hash
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BASE_URL } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Status config with modern sleek styling ─────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; gradient: string }> = {
    pending:   { label: 'في الانتظار',  color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200/50', icon: Clock, gradient: 'from-amber-400 to-amber-500' },
    confirmed: { label: 'مؤكد',         color: 'text-blue-700',  bg: 'bg-blue-50/50',  border: 'border-blue-200/50',  icon: CheckCircle2, gradient: 'from-blue-600 to-blue-500' },
    completed: { label: 'مكتمل',        color: 'text-teal-700',  bg: 'bg-teal-50/50',  border: 'border-teal-200/50',  icon: CheckCircle2, gradient: 'from-teal-500 to-emerald-400' },
    cancelled: { label: 'ملغي',         color: 'text-rose-700',  bg: 'bg-rose-50/50',  border: 'border-rose-200/50',  icon: X, gradient: 'from-rose-500 to-red-500' },
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
            fetchAppointment(); 
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err.response?.data?.message || 'حدث خطأ أثناء الإلغاء' });
        } finally {
            setCancelLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 pb-24 flex items-center justify-center" dir="rtl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

    const avatarUrl = appointment.user?.avatar
        ? (appointment.user.avatar.startsWith('http') ? appointment.user.avatar : `${BASE_URL}${appointment.user.avatar.startsWith('/') ? '' : '/'}${appointment.user.avatar}`)
        : null;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans" dir="rtl">
            {/* Minimal top gradient strip */}
            <div className="w-full h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-orange-500" />

            {/* Sticky Header with Actions */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/patient/appointments')}
                        className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-blue-600 transition-colors bg-white rounded-full px-3 py-1.5 shadow-sm border border-slate-100"
                    >
                        <ArrowRight className="h-3.5 w-3.5" />
                        رجوع
                    </button>
                    <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4", status.color)} />
                        <span className={cn("text-xs font-black tracking-wide", status.color)}>{status.label}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
                
                {/* ── 1. Unified Doctor & Status Card ── */}
                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
                    <div className={cn("absolute top-0 w-full h-1.5 bg-gradient-to-r", status.gradient)} />
                    
                    <div className="p-4 sm:p-5 flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-100 to-orange-50 rounded-xl blur-md opacity-70" />
                            <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={doctorName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="font-black text-2xl text-slate-300">{doctorName.charAt(0)}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1 flex items-center gap-1">
                                        <Hash className="h-3 w-3" /> {appointment.id}
                                    </p>
                                    <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                                        {doctorName}
                                    </h1>
                                </div>
                            </div>
                            {specialty && (
                                <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600">
                                    {specialty}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center justify-center text-center">
                                <Calendar className="h-4 w-4 text-blue-600 mb-1" />
                                <span className="text-[10px] font-bold text-blue-400">التاريخ</span>
                                <span className="text-sm font-black text-blue-900">{format(apptDate, 'dd MMMM yyyy', { locale: ar })}</span>
                            </div>
                            <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-100/50 flex flex-col items-center justify-center text-center">
                                <Clock className="h-4 w-4 text-orange-500 mb-1" />
                                <span className="text-[10px] font-bold text-orange-400">الوقت</span>
                                <span className="text-sm font-black text-orange-900">{format(apptDate, 'hh:mm a', { locale: ar })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 2. Compact Clinic Info ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 sm:p-5">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-slate-300" /> تفاصيل العيادة
                    </h2>
                    
                    <div className="space-y-3">
                        {clinicName !== doctorName && (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-slate-400 font-bold">اسم العيادة</p>
                                    <p className="text-sm font-bold text-slate-800 truncate">{clinicName}</p>
                                </div>
                            </div>
                        )}
                        
                        {address && (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-slate-400 font-bold">الموقع</p>
                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{address}</p>
                                </div>
                            </div>
                        )}

                        {phone && (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-500">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-slate-400 font-bold">الهاتف</p>
                                    <a href={`tel:${phone}`} className="text-sm font-black text-blue-600 block truncate" dir="ltr">{phone}</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 3. Patient Notes ── */}
                {appointment.notes && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 sm:p-5">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-slate-300" /> ملاحظاتي
                        </h2>
                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {appointment.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── 4. Medical Records (Modern Compact) ── */}
                {appointment.medicalRecords?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 sm:p-5 overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-br-full -z-0 opacity-50" />
                        
                        <h2 className="text-xs font-black text-teal-600 uppercase tracking-wider mb-3 flex items-center gap-1.5 relative z-10">
                            <Stethoscope className="h-4 w-4" /> السجل الطبي للزيارة
                        </h2>
                        
                        <div className="space-y-3 relative z-10">
                            {appointment.medicalRecords.map((rec: any) => (
                                <div key={rec.id} className="space-y-3">
                                    {rec.diagnosis && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">التشخيص</p>
                                            <p className="text-sm font-bold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{rec.diagnosis}</p>
                                        </div>
                                    )}
                                    {rec.treatment && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">خطة العلاج / الأدوية</p>
                                            <p className="text-sm font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">{rec.treatment}</p>
                                        </div>
                                    )}
                                    {rec.aiAdvice && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100/50">
                                            <p className="text-[10px] font-black text-blue-600 uppercase mb-1.5 flex items-center gap-1">
                                                <span>✨</span> نصيحة الذكاء الاصطناعي
                                            </p>
                                            <p className="text-xs font-medium text-slate-700 leading-relaxed">{rec.aiAdvice}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── 5. Cancellation Reason ── */}
                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                    <div className="bg-red-50/80 rounded-2xl border border-red-100 p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-black text-red-800 mb-0.5">سبب الإلغاء</p>
                            <p className="text-sm font-bold text-red-600">{appointment.cancellationReason}</p>
                        </div>
                    </div>
                )}

                {/* ── 6. Fixed Bottom Action Grid ── */}
                <div className="pt-4 grid grid-cols-2 gap-2.5">
                    {clinicId && (
                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 font-bold h-12 shadow-sm"
                            onClick={() => navigate(`/patient/clinics/${clinicId}`)}
                        >
                            <Building2 className="h-4 w-4 ml-2" />
                            العيادة
                        </Button>
                    )}

                    {canCancel && (
                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-12 shadow-sm"
                            onClick={() => setCancelOpen(true)}
                        >
                            <X className="h-4 w-4 ml-2" />
                            إلغاء الموعد
                        </Button>
                    )}

                    {(!canCancel) && clinicId && (
                        <Button
                            className="w-full rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 text-white font-bold h-12 shadow-md hover:shadow-lg transition-all"
                            onClick={() => navigate(`/patient/clinics/${clinicId}`)}
                        >
                            <Calendar className="h-4 w-4 ml-2" />
                            حجز موعد جديد
                        </Button> // Takes the second slot if canCancel is false
                    )}
                </div>

            </main>

            {/* Cancel Alert Dialog */}
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogContent className="rounded-2xl sm:rounded-2xl max-w-[90vw] sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 font-black">
                            <AlertCircle className="h-5 w-5" />
                            تأكيد الإلغاء
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed font-sans">
                            هل أنت متأكد من إلغاء موعدك مع <span className="font-bold text-slate-800">{doctorName}</span> المجدول في{' '}
                            <span className="font-bold text-slate-800">{format(apptDate, 'dd MMMM', { locale: ar })}</span>؟
                            <br/><br/>
                            هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2 mt-4">
                        <AlertDialogCancel disabled={cancelLoading} className="rounded-xl font-bold mt-0">تراجع</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={cancelLoading}
                            className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold"
                        >
                            {cancelLoading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : 'تأكيد الإلغاء'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
