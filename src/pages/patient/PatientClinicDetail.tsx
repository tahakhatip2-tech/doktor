import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Clock, Calendar, MessageCircle, ArrowRight, ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle, Plus, Search, User, Star, Pill } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { format, startOfDay, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BASE_URL } from '@/lib/api';
import PatientHero from '@/components/patient/PatientHero';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// â”€â”€â”€ الأيام باللغة العربية â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DAY_NAMES_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function PatientClinicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [clinic, setClinic] = useState<any>(null);
    const [loadingClinic, setLoadingClinic] = useState(true);

    // â”€â”€ التقويم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // â”€â”€ الـ Slots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // â”€â”€ Booking Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [bookingOpen, setBookingOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    // ── التقييمات ───────────────────────────────────────────────
    const [reviewsData, setReviewsData] = useState<any>(null);
    const [myReview, setMyReview] = useState<any>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    // ── Prescriptions (If Pharmacy) ──
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
    const [sendingPrescription, setSendingPrescription] = useState(false);
    const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

    // ── جلب بيانات العيادة ──â”€
    useEffect(() => {
        const fetchClinic = async () => {
            try {
                const token = localStorage.getItem('patient_token');
                const response = await axios.get(`${API_URL}/patient/clinics/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const clinicData = response.data;
                setClinic(clinicData);

                // If pharmacy, fetch prescriptions
                if (clinicData.role === 'PHARMACY') {
                    fetchPrescriptions();
                }
            } catch {
                toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم العثور على المكان' });
                navigate('/patient/clinics');
            } finally {
                setLoadingClinic(false);
            }
        };
        if (id) fetchClinic();
    }, [id]);

    const fetchPrescriptions = async () => {
        try {
            setLoadingPrescriptions(true);
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/prescriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter only PENDING prescriptions
            const pending = (res.data || []).filter((p: any) => p.status === 'PENDING');
            setPrescriptions(pending);
        } catch {
            console.error('Failed to fetch prescriptions');
        } finally {
            setLoadingPrescriptions(false);
        }
    };

    // â”€â”€ جلب الـ Slots عند اختيار يوم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchSlots = useCallback(async (date: Date) => {
        if (!id) return;
        setLoadingSlots(true);
        setSlots([]);
        setSelectedSlot(null);
        try {
            const token = localStorage.getItem('patient_token');
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await axios.get(
                `${API_URL}/patient/clinics/${id}/available-slots?date=${dateStr}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSlots(response.data.slots || []);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحميل المواعيد المتاحة' });
        } finally {
            setLoadingSlots(false);
        }
    }, [id]);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        fetchSlots(date);
    };

    // â”€â”€ إرسال الحجز â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot || !clinic) return;

        setBookingLoading(true);
        try {
            const token = localStorage.getItem('patient_token');

            // بناء التاريخ والوقت الكامل
            const [time, period] = selectedSlot.split(' ');
            const [hoursRaw, minutes] = time.split(':').map(Number);
            let hours = hoursRaw;
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const appointmentDate = new Date(selectedDate);
            appointmentDate.setHours(hours, minutes, 0, 0);

            await axios.post(
                `${API_URL}/patient/appointments`,
                {
                    clinicId: clinic.id,
                    appointmentDate: appointmentDate.toISOString(),
                    notes,
                    duration: 30,
                    ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: 'âœ… تم إرسال طلب الحجز!',
                description: `موعدك يوم ${format(selectedDate, 'EEEE dd MMMM', { locale: ar })} الساعة ${selectedSlot} â€” في انتظار تأكيد الطبيب`,
            });

            setBookingOpen(false);
            setSelectedSlot(null);
            setNotes('');
            
            // Redirect to appointments page after a short delay
            setTimeout(() => {
                navigate('/patient/appointments');
            }, 1000);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ في الحجز',
                description: err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب',
            });
            setBookingLoading(false);
        }
    };

    // ── إرسال الوصفة للصيدلية ──
    const handleSendPrescription = async () => {
        if (!selectedPrescriptionId || !clinic || clinic.role !== 'PHARMACY') return;
        setSendingPrescription(true);
        try {
            const token = localStorage.getItem('patient_token');
            await axios.post(
                `${API_URL}/patient/prescriptions/${selectedPrescriptionId}/send-to-pharmacy`,
                { pharmacyId: clinic.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({
                title: '✅ تم إرسال الوصفة بنجاح!',
                description: 'تم إرسال الوصفة إلى الصيدلية، بانتظار صرفها.',
            });
            setPrescriptionDialogOpen(false);
            setSelectedPrescriptionId(null);
            // Refresh prescriptions
            fetchPrescriptions();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ في الإرسال',
                description: err.response?.data?.message || 'حدث خطأ أثناء إرسال الوصفة',
            });
        } finally {
            setSendingPrescription(false);
        }
    };

    // ── جلب التقييمات ───────────────────────────────────────────
    const fetchReviews = useCallback(async () => {
        if (!id) return;
        try {
            const [reviewsRes, myReviewRes] = await Promise.all([
                axios.get(`${API_URL}/patient/clinics/${id}/reviews`),
                axios.get(`${API_URL}/patient/clinics/${id}/my-review`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('patient_token')}` },
                }).catch(() => ({ data: null })),
            ]);
            setReviewsData(reviewsRes.data);
            setMyReview(myReviewRes.data);
        } catch { /* ignore */ }
    }, [id]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // ── إرسال تقييم ─────────────────────────────────────────────
    const handleSubmitReview = async () => {
        if (!id) return;
        setReviewLoading(true);
        try {
            await axios.post(
                `${API_URL}/patient/clinics/${id}/reviews`,
                { rating: reviewRating, comment: reviewComment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('patient_token')}` } }
            );
            toast({ title: '✅ شكراً على تقييمك!', description: 'تم حفظ تقييمك بنجاح' });
            setReviewOpen(false);
            fetchReviews();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'لم يتم الإرسال',
                description: err.response?.data?.message || 'يمكنك التقييم فقط بعد إتمام زيارة',
            });
        } finally {
            setReviewLoading(false);
        }
    };



    // â”€â”€ بناء أيام التقويم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const calendarDays = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });
        const startWeekday = getDay(start); // 0=Sunday
        const fillersBefore = Array(startWeekday).fill(null);
        return [...fillersBefore, ...days];
    };

    const today = startOfDay(new Date());

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (loadingClinic) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!clinic) return null;

    return (
        <div className="space-y-0 animate-fade-in w-full pb-20">

            {/* ── Hero Section ── */}
            <PatientHero
                title={clinic.clinic_name || clinic.name}
                subtitle={`الدكتور: ${clinic.name}`}
                badgeText={clinic.clinic_specialty || 'العيادة'}
                showBackButton={true}
            />

            {/* ── Action Bar ── */}
            <div className="px-4 mt-2 relative z-50 max-w-5xl mx-auto">
                <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border p-3 flex flex-col gap-3">

                    {/* Row 1: Clinic Logo + Name + Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-orange-100 bg-gradient-to-br from-blue-50 to-blue-100 shrink-0 flex items-center justify-center shadow-sm">
                            {(clinic.clinic_logo || clinic.avatar) ? (
                                <img
                                    src={(clinic.clinic_logo || clinic.avatar)?.startsWith('http')
                                        ? (clinic.clinic_logo || clinic.avatar)
                                        : `${BASE_URL}${(clinic.clinic_logo || clinic.avatar)?.startsWith('/') ? '' : '/'}${clinic.clinic_logo || clinic.avatar}`}
                                    alt={clinic.clinic_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xl font-black text-blue-700">
                                    {(clinic.clinic_name || clinic.name || '?').charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <p className="font-black text-sm text-foreground truncate">{clinic.clinic_name || clinic.name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                                {clinic.clinic_address && (
                                    <span className="flex items-center gap-1 truncate max-w-[130px]">
                                        <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                                        {clinic.clinic_address}
                                    </span>
                                )}
                                {clinic.working_hours && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-orange-400 shrink-0" />
                                        {clinic.working_hours}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Action Buttons */}
                    <div className="flex items-center gap-2 w-full">
                        {clinic.location_url && (
                            <Button size="sm" variant="outline"
                                className="flex-1 gap-1.5 rounded-xl h-9 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                onClick={() => window.open(clinic.location_url, '_blank')}>
                                <MapPin className="h-3.5 w-3.5 shrink-0" />الموقع
                            </Button>
                        )}
                        <Button size="sm"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
                            onClick={() => { const p = clinic.clinic_phone || clinic.phone; if (p) window.open(`tel:${p}`, '_self'); }}>
                            <Phone className="h-3.5 w-3.5 shrink-0" />اتصال
                        </Button>
                        <Button size="sm"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0"
                            onClick={() => navigate(`/patient/chat/${clinic.id}`)}>
                            <MessageCircle className="h-3.5 w-3.5 shrink-0" />مراسلة
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Container for the rest ── */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6 mt-4">

                {/* ── طاقم العيادة (الأطباء) ── */}
                {clinic.clinicDoctors && clinic.clinicDoctors.length > 0 && clinic.role !== 'PHARMACY' && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                            <User className="w-5 h-5 text-blue-500" />
                            طاقم العيادة
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clinic.clinicDoctors.map((doctor: any) => (
                                <Card key={doctor.id} className="shadow-sm hover:shadow-md transition-shadow border-slate-100">
                                    <CardContent className="p-4 flex gap-4">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 shrink-0 bg-blue-50">
                                            {doctor.avatar ? (
                                                <img 
                                                    src={doctor.avatar.startsWith('http') || doctor.avatar.startsWith('data:') ? doctor.avatar : `${BASE_URL}${doctor.avatar.startsWith('/') ? '' : '/'}${doctor.avatar}`} 
                                                    alt={doctor.name} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {
                                                        // Fallback if image fails to load
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={cn("w-full h-full bg-blue-50 items-center justify-center text-blue-600 font-bold text-xl", doctor.avatar ? "hidden flex" : "flex")}>
                                                {doctor.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                                            <p className="font-bold text-slate-800 text-sm truncate">{doctor.name}</p>
                                            {doctor.specialty && (
                                                <p className="text-xs text-blue-600 font-medium truncate mb-1">{doctor.specialty}</p>
                                            )}
                                            {(doctor.workingHours || doctor.workingDays) && (
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    {doctor.workingDays && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Calendar className="w-3 h-3 text-orange-400" />
                                                            <span className="truncate">{doctor.workingDays}</span>
                                                        </div>
                                                    )}
                                                    {doctor.workingHours && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Clock className="w-3 h-3 text-orange-400" />
                                                            <span className="truncate">{doctor.workingHours}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

            {/* ── قسم الحجز أو صرف الوصفات ── */}
            {clinic.role === 'PHARMACY' ? (
                <Card className="shadow-card border-green-100">
                    <CardHeader className="bg-green-50/50">
                        <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                            <Pill className="h-5 w-5" />
                            صرف وصفة طبية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loadingPrescriptions ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-3" />
                                <p className="text-sm text-slate-500">جاري تحميل وصفاتك...</p>
                            </div>
                        ) : prescriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-slate-500 font-bold text-lg">لا توجد وصفات قيد الانتظار</p>
                                <p className="text-sm text-slate-400 mt-2 max-w-sm">لصرف دواء من هذه الصيدلية، يجب أن يكتب لك الطبيب وصفة طبية أولاً لتظهر هنا.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 font-medium mb-2">اختر الوصفة التي تود صرفها:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {prescriptions.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPrescriptionId(p.id)}
                                            className={cn(
                                                'p-3 rounded-xl border text-right transition-all flex flex-col gap-2',
                                                selectedPrescriptionId === p.id
                                                    ? 'border-green-500 bg-green-50 shadow-sm ring-1 ring-green-500'
                                                    : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-bold text-sm text-slate-800">وصفة طبية</span>
                                                <span className="text-xs text-slate-500">{format(new Date(p.createdAt), 'dd MMM yyyy', { locale: ar })}</span>
                                            </div>
                                            {p.doctor && (
                                                <div className="text-xs text-slate-600 bg-white px-2 py-1 rounded-md border inline-flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {p.doctor.clinic_name || p.doctor.name}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                                    disabled={!selectedPrescriptionId}
                                    onClick={() => setPrescriptionDialogOpen(true)}
                                >
                                    إرسال الوصفة للصيدلية
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* التقويم */}
                    <Card className="shadow-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    اختر اليوم
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium min-w-[100px] text-center">
                                        {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* رؤوس الأيام */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAY_NAMES_AR.map(d => (
                                    <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            {/* أيام الشهر */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays().map((day, idx) => {
                                    if (!day) return <div key={`empty-${idx}`} />;
                                    const isPast = day < today;
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isToday = isSameDay(day, today);
                                    return (
                                        <button
                                            key={day.toISOString()}
                                            disabled={isPast}
                                            onClick={() => handleSelectDate(day)}
                                            className={cn(
                                                'h-9 w-full rounded-lg text-sm font-medium transition-all',
                                                isPast && 'opacity-30 cursor-not-allowed',
                                                !isPast && !isSelected && 'hover:bg-primary/10',
                                                isToday && !isSelected && 'border border-primary text-primary',
                                                isSelected && 'gradient-primary text-white shadow-glow scale-105',
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* الـ Slots */}
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                المواعيد المتاحة
                                {selectedDate && (
                                    <span className="text-sm font-normal text-muted-foreground mr-auto">
                                        {format(selectedDate, 'EEEE dd MMM', { locale: ar })}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!selectedDate ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Calendar className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                    <p className="text-muted-foreground">اختر يوماً من التقويم لعرض المواعيد المتاحة</p>
                                </div>
                            ) : loadingSlots ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {Array(6).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-10 rounded-lg" />
                                    ))}
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                    <p className="text-muted-foreground font-medium">لا توجد مواعيد متاحة</p>
                                    <p className="text-muted-foreground text-sm mt-1">يرجى اختيار يوم آخر</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        {slots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot === selectedSlot ? null : slot)}
                                                className={cn(
                                                    'h-10 rounded-lg text-sm font-medium border transition-all',
                                                    selectedSlot === slot
                                                        ? 'gradient-primary text-white border-transparent shadow-glow scale-105'
                                                        : 'border-border hover:border-primary hover:text-primary bg-background'
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>

                                    {/* زر تأكيد الحجز */}
                                    <Button
                                        className="w-full gradient-primary text-white shadow-glow gap-2"
                                        disabled={!selectedSlot}
                                        onClick={() => setBookingOpen(true)}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        {selectedSlot
                                            ? `احجز الساعة ${selectedSlot}`
                                            : 'اختر موعداً للمتابعة'
                                        }
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* â”€â”€ Dialog تأكيد الحجز â”€â”€ */}
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            تأكيد الحجز
                        </DialogTitle>
                        <DialogDescription>
                            راجع تفاصيل موعدك قبل التأكيد
                        </DialogDescription>
                    </DialogHeader>

                    {/* ملخص الموعد */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3 border">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">العيادة</p>
                                <p className="font-semibold">{clinic.clinic_name || clinic.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">التاريخ</p>
                                <p className="font-semibold">
                                    {selectedDate && format(selectedDate, 'EEEEطŒ dd MMMM yyyy', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">الوقت</p>
                                <p className="font-semibold">{selectedSlot}</p>
                            </div>
                        </div>
                    </div>

                    {/* ملاحظات */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات للطبيب (اختياري)</Label>
                        <Textarea
                            id="notes"
                            placeholder="أضف أي تفاصيل تساعد الطبيب في الاستعداد لزيارتك..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* حجز لشخص آخر (جديد) */}
                    <div className="space-y-2">
                        <Label htmlFor="customerName">اسم المريض (إذا كنت تحجز لشخص آخر)</Label>
                        <Input
                            id="customerName"
                            placeholder="اختياري - اترك الحقل فارغاً إذا كان الحجز لك"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        سيتم إرسال طلب الموعد إلى الطبيب وستشعر عند التأكيد.
                    </p>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBookingOpen(false)}
                            disabled={bookingLoading}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            className="flex-1 gradient-primary text-white"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? (
                                <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الحجز...</>
                            ) : (
                                'تأكيد الحجز'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog إرسال الوصفة ── */}
            <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-5 w-5" />
                            تأكيد إرسال الوصفة
                        </DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من إرسال هذه الوصفة إلى {clinic?.clinic_name || clinic?.name}؟
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-sm text-slate-600 bg-slate-50 border rounded-lg p-3">
                        سيتم إرسال الوصفة الطبية، وسيقوم الصيدلاني بتحضير الدواء لك. يمكنك التواصل معه عبر زر المراسلة لمزيد من التفاصيل.
                    </p>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPrescriptionDialogOpen(false)}
                            disabled={sendingPrescription}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleSendPrescription}
                            disabled={sendingPrescription}
                        >
                            {sendingPrescription ? (
                                <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الإرسال...</>
                            ) : (
                                'تأكيد وإرسال'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── قسم التقييمات ──────────────────────────────── */}
            <Card className="shadow-card overflow-hidden">
                <div className="h-1 gradient-primary" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            آراء المرضى
                            {reviewsData && (
                                <Badge variant="secondary" className="font-bold">{reviewsData.totalReviews} تقييم</Badge>
                            )}
                        </CardTitle>
                        <Button size="sm" className="gradient-primary text-white gap-2 shadow-glow"
                            onClick={() => {
                                if (myReview) { setReviewRating(myReview.rating); setReviewComment(myReview.comment || ''); }
                                setReviewOpen(true);
                            }}>
                            <Star className="h-4 w-4" />
                            {myReview ? 'تعديل تقييمك' : 'أضف تقييمك'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {reviewsData && reviewsData.totalReviews > 0 && (
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-xl border">
                            <div className="text-center flex-shrink-0">
                                <p className="text-5xl font-black">{reviewsData.avgRating}</p>
                                <div className="flex items-center gap-0.5 justify-center mt-1">
                                    {[1,2,3,4,5].map((s) => (
                                        <Star key={s} className={cn('h-4 w-4', s <= Math.round(reviewsData.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')} />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{reviewsData.totalReviews} تقييم</p>
                            </div>
                            <div className="flex-1 space-y-1.5 w-full">
                                {[5,4,3,2,1].map((star) => {
                                    const d = reviewsData.distribution?.find((x: any) => x.star === star);
                                    const count = d?.count || 0;
                                    const pct = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-xs w-4 text-right font-bold text-muted-foreground">{star}</span>
                                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground w-4">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {!reviewsData || reviewsData.totalReviews === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Star className="h-12 w-12 text-muted-foreground/20 mb-3" />
                            <p className="text-muted-foreground font-medium">لا توجد تقييمات بعد</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">كن أول من يقيّم هذه العيادة!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviewsData.reviews.map((review: any) => (
                                <div key={review.id} className="p-4 rounded-xl border bg-background hover:bg-muted/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-black text-sm border border-primary/20">
                                            {review.patientName?.charAt(0) || 'م'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <p className="font-semibold text-sm">{review.patientName}</p>
                                                <div className="flex items-center gap-0.5">
                                                    {[1,2,3,4,5].map((s) => (
                                                        <Star key={s} className={cn('h-3.5 w-3.5', s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20')} />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.comment}</p>}
                                            <p className="text-[11px] text-muted-foreground/50 mt-1.5">{format(new Date(review.createdAt), 'dd MMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Dialog التقييم ─────────────────────────────── */}
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            {myReview ? 'تعديل تقييمك' : 'أضف تقييمك'}
                        </DialogTitle>
                        <DialogDescription>شاركنا رأيك في {clinic?.clinic_name || clinic?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label>تقييمك</Label>
                            <div className="flex items-center gap-2 justify-center py-2">
                                {[1,2,3,4,5].map((s) => (
                                    <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-125 focus:outline-none">
                                        <Star className={cn('h-9 w-9 transition-colors', s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300')} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-sm text-muted-foreground font-medium">
                                {reviewRating === 5 ? 'ممتاز جداً 🌟' : reviewRating === 4 ? 'جيد جداً 👍' : reviewRating === 3 ? 'مقبول 🆗' : reviewRating === 2 ? 'ضعيف 👎' : 'سيئ جداً ❌'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="review-comment">تعليقك (اختياري)</Label>
                            <Textarea id="review-comment" placeholder="أخبرنا عن تجربتك مع هذه العيادة..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={reviewLoading} className="flex-1">إلغاء</Button>
                        <Button className="flex-1 gradient-primary text-white" onClick={handleSubmitReview} disabled={reviewLoading}>
                            {reviewLoading ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جاري الحفظ...</> : 'حفظ التقييم'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}
