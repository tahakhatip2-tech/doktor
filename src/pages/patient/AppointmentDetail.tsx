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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Calendar, Clock, MapPin, Phone, Building2,
    FileText, X, Loader2, ArrowRight, CheckCircle2,
    AlertCircle, User, Stethoscope, Hash,
    Download, Send, Pill, ChevronLeft, Video
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
    const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
    const [pharmaciesOpen, setPharmaciesOpen] = useState(false);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [pharmaciesLoading, setPharmaciesLoading] = useState(false);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
    const [sendingPrescription, setSendingPrescription] = useState(false);

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

    const handleGeneratePdf = async (docType: string) => {
        setGeneratingPdf(docType);
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.post(
                `${API_URL}/patient/appointments/${id}/pdf`,
                { docType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Create a temporary link to download the file
            const url = `${BASE_URL}${res.data.url}`;
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = `${docType}_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast({ title: '✅ تم بنجاح', description: 'تم إنشاء وفتح الملف بنجاح.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err.response?.data?.message || 'فشل في إنشاء الملف' });
        } finally {
            setGeneratingPdf(null);
        }
    };

    const fetchPharmacies = async () => {
        setPharmaciesLoading(true);
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/pharmacies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPharmacies(res.data);
        } catch (err) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لم نتمكن من جلب قائمة الصيدليات' });
        } finally {
            setPharmaciesLoading(false);
        }
    };

    const openPharmacyDialog = (prescriptionId: number) => {
        setSelectedPrescriptionId(prescriptionId);
        setPharmaciesOpen(true);
        if (pharmacies.length === 0) {
            fetchPharmacies();
        }
    };

    const sendToPharmacy = async (pharmacyId: number) => {
        if (!selectedPrescriptionId) return;
        setSendingPrescription(true);
        try {
            const token = localStorage.getItem('patient_token');
            await axios.post(
                `${API_URL}/patient/prescriptions/${selectedPrescriptionId}/send-to-pharmacy`,
                { pharmacyId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: '✅ تم الإرسال', description: 'تم إرسال وصفتك إلى الصيدلية بنجاح.' });
            setPharmaciesOpen(false);
            fetchAppointment(); // Refresh to update status
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err.response?.data?.message || 'حدث خطأ أثناء الإرسال' });
        } finally {
            setSendingPrescription(false);
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

                        {/* Video Call Button */}
                        {appointment.isVideo && appointment.status !== 'cancelled' && (
                            <div className="mt-4">
                                <Button
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                    onClick={() => navigate(`/patient/appointments/${appointment.id}/video`)}
                                    disabled={appointment.status === 'completed'}
                                >
                                    <Video className="h-5 w-5 ml-2" />
                                    {appointment.status === 'completed' ? 'تمت الاستشارة عبر الفيديو' : 'انضم للمكالمة'}
                                </Button>
                            </div>
                        )}
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

                {/* ── 4. Medical Documents (Prescription, Sick Leave, Referral) ── */}
                {appointment.medicalRecords?.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                            <FileText className="h-4 w-4 text-slate-300" /> الوثائق الطبية
                        </h2>
                        
                        {appointment.medicalRecords.map((rec: any) => {
                            let parsedMeds: any[] = [];
                            try {
                                if (rec.medications) {
                                    parsedMeds = typeof rec.medications === 'string' ? JSON.parse(rec.medications) : rec.medications;
                                }
                            } catch(e) { /* ignore parse errors */ }

                            const prescription = appointment.prescriptions?.find((p: any) => p.appointmentId === appointment.id);
                            const prescriptionStatus = prescription?.status || null;

                            const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
                                'PENDING': { label: 'بانتظار الإرسال', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '⏳' },
                                'SENT_TO_PHARMACY': { label: 'تم الإرسال للصيدلية', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: '📤' },
                                'DISPENSED': { label: 'تم الصرف', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '✅' },
                                'REJECTED': { label: 'مرفوضة', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '❌' },
                            };

                            return (
                                <div key={rec.id} className="space-y-4">
                                    {/* ─── 1. Prescription Card ─── */}
                                    {(parsedMeds.length > 0 || rec.treatment || rec.diagnosis) && (
                                        <div className="bg-white rounded-2xl border border-blue-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 sm:p-4 flex items-center justify-between text-white">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                        <Pill className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm sm:text-base">الوصفة الطبية</h3>
                                                        <p className="text-blue-100 text-[10px] sm:text-xs font-medium">د. {doctorName} — {clinicName}</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white border-none text-xs font-bold backdrop-blur-sm"
                                                    onClick={() => handleGeneratePdf('prescription')}
                                                    disabled={generatingPdf === 'prescription'}
                                                >
                                                    {generatingPdf === 'prescription' ? <Loader2 className="h-3 w-3 animate-spin ml-1" /> : <Download className="h-3 w-3 ml-1" />}
                                                    PDF
                                                </Button>
                                            </div>
                                            
                                            <div className="p-4 sm:p-5 space-y-4">
                                                {/* Prescription Status Badge */}
                                                {prescriptionStatus && STATUS_LABELS[prescriptionStatus] && (
                                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${STATUS_LABELS[prescriptionStatus].bg}`}>
                                                        <span className="text-sm">{STATUS_LABELS[prescriptionStatus].icon}</span>
                                                        <span className={`text-xs font-black ${STATUS_LABELS[prescriptionStatus].color}`}>
                                                            {STATUS_LABELS[prescriptionStatus].label}
                                                        </span>
                                                        {prescriptionStatus === 'SENT_TO_PHARMACY' && prescription?.pharmacy && (
                                                            <span className="text-xs font-bold text-blue-600 mr-auto flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {prescription.pharmacy.clinic_name || prescription.pharmacy.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {rec.diagnosis && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">التشخيص</p>
                                                        <p className="text-sm font-bold text-slate-800">{rec.diagnosis}</p>
                                                    </div>
                                                )}

                                                {parsedMeds.length > 0 ? (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">الأدوية الموصوفة ({parsedMeds.length})</p>
                                                        <div className="space-y-2">
                                                            {parsedMeds.map((med: any, idx: number) => (
                                                                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start justify-between gap-2">
                                                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                                                        <div className="h-7 w-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                            <Pill className="h-3.5 w-3.5" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-black text-blue-900 truncate">{med.name}</p>
                                                                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{med.type} • {med.frequency}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap flex-shrink-0">
                                                                        {med.duration}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : rec.treatment ? (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">خطة العلاج</p>
                                                        <p className="text-sm font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{rec.treatment}</p>
                                                    </div>
                                                ) : null}

                                                {rec.aiAdvice && (
                                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3.5 rounded-xl border border-indigo-100/50">
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase mb-1.5 flex items-center gap-1">
                                                            <span>✨</span> نصيحة الذكاء الاصطناعي
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-700 leading-relaxed">{rec.aiAdvice}</p>
                                                    </div>
                                                )}

                                                {/* Send to Pharmacy CTA */}
                                                {prescription && prescriptionStatus === 'PENDING' && (
                                                    <Button 
                                                        className="w-full mt-2 rounded-xl h-11 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
                                                        onClick={() => openPharmacyDialog(prescription.id)}
                                                    >
                                                        <Send className="h-4 w-4 ml-2" />
                                                        إرسال إلى صيدلية
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── 2. Sick Leave Card ─── */}
                                    {rec.sickLeaveDays && (
                                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-3 sm:p-4 flex items-center justify-between text-white">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                        <FileText className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm sm:text-base">إجازة مرضية</h3>
                                                        <p className="text-emerald-50 text-[10px] sm:text-xs font-medium">{rec.sickLeaveDays} أيام</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white border-none text-xs font-bold backdrop-blur-sm"
                                                    onClick={() => handleGeneratePdf('sick_leave')}
                                                    disabled={generatingPdf === 'sick_leave'}
                                                >
                                                    {generatingPdf === 'sick_leave' ? <Loader2 className="h-3 w-3 animate-spin ml-1" /> : <Download className="h-3 w-3 ml-1" />}
                                                    تصدير
                                                </Button>
                                            </div>
                                            <div className="p-4 sm:p-5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">السبب الطبي</p>
                                                <p className="text-sm font-bold text-slate-800">{rec.sickLeaveReason || rec.diagnosis || 'لم يتم تحديد سبب'}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── 3. Referral Card ─── */}
                                    {rec.referralTo && (
                                        <div className="bg-white rounded-2xl border border-purple-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                                            <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-3 sm:p-4 flex items-center justify-between text-white">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                        <ArrowRight className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-sm sm:text-base">تحويل طبي</h3>
                                                        <p className="text-purple-100 text-[10px] sm:text-xs font-medium line-clamp-1">{rec.referralTo}</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white border-none text-xs font-bold backdrop-blur-sm"
                                                    onClick={() => handleGeneratePdf('referral')}
                                                    disabled={generatingPdf === 'referral'}
                                                >
                                                    {generatingPdf === 'referral' ? <Loader2 className="h-3 w-3 animate-spin ml-1" /> : <Download className="h-3 w-3 ml-1" />}
                                                    تصدير
                                                </Button>
                                            </div>
                                            <div className="p-4 sm:p-5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">سبب التحويل / الملاحظات</p>
                                                <p className="text-sm font-bold text-slate-800">{rec.referralReason || 'لم يتم التحديد'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

            {/* Pharmacies Dialog */}
            <Dialog open={pharmaciesOpen} onOpenChange={setPharmaciesOpen}>
                <DialogContent className="rounded-2xl sm:rounded-2xl max-w-[90vw] sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col font-sans" dir="rtl">
                    <DialogHeader className="pb-4 border-b border-slate-100 flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2 text-blue-900 font-black">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            اختر صيدلية لعملية الصرف
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold text-slate-500 mt-2">
                            اختر إحدى الصيدليات المعتمدة لإرسال الوصفة الطبية إليها، ليتم تجهيز الأدوية مسبقاً.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                        {pharmaciesLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                <p className="text-sm font-bold text-slate-500">جاري تحميل الصيدليات...</p>
                            </div>
                        ) : pharmacies.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm font-bold text-slate-500">لا توجد صيدليات متاحة حالياً</p>
                            </div>
                        ) : (
                            pharmacies.map((pharmacy) => (
                                <div key={pharmacy.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                     onClick={() => sendToPharmacy(pharmacy.id)}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 truncate">{pharmacy.clinic_name || pharmacy.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                                <MapPin className="h-3 w-3" /> {pharmacy.clinic_address || 'غير محدد'}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Button size="sm" disabled={sendingPrescription} className="h-8 rounded-lg font-bold bg-slate-100 text-blue-700 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                إرسال
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
