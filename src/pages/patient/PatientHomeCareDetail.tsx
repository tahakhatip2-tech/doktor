import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    HeartPulse, MapPin, Phone, Clock, Star, ArrowRight,
    MessageCircle, Share2, ChevronRight, CheckCircle2,
    Calendar, ChevronLeft, Loader2,
    Stethoscope, Bandage, Syringe, Dumbbell, Pill, ClipboardList,
    Microscope, Activity, Cookie, Footprints, Salad, Sofa, Home,
    type LucideIcon
} from 'lucide-react';
import axios from 'axios';
import { format, startOfDay, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BASE_URL } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SERVICE_ICONS: Array<{ keys: string[]; icon: LucideIcon; color: string }> = [
    { keys: ['تمريض', 'ممرض', 'تمريضي'], icon: Stethoscope, color: 'text-blue-500' },
    { keys: ['جرح', 'ضماد', 'تضميد'], icon: Bandage, color: 'text-rose-500' },
    { keys: ['حقن', 'حقنة', 'إبرة'], icon: Syringe, color: 'text-purple-500' },
    { keys: ['فيزياء', 'علاج طبيعي', 'تأهيل'], icon: Dumbbell, color: 'text-orange-500' },
    { keys: ['علاج', 'دواء', 'أدوية'], icon: Pill, color: 'text-emerald-500' },
    { keys: ['متابعة', 'مراجعة'], icon: ClipboardList, color: 'text-indigo-500' },
    { keys: ['فحص', 'تشخيص'], icon: Microscope, color: 'text-cyan-500' },
    { keys: ['ضغط', 'قلب'], icon: Activity, color: 'text-red-500' },
    { keys: ['سكر', 'سكري'], icon: Cookie, color: 'text-amber-500' },
    { keys: ['قدم', 'قدم السكري'], icon: Footprints, color: 'text-teal-500' },
    { keys: ['تغذية', 'نظام غذائي'], icon: Salad, color: 'text-green-500' },
    { keys: ['جلسة', 'راحة'], icon: Sofa, color: 'text-violet-500' },
];

function getServiceIconConfig(name: string): { icon: LucideIcon; color: string } {
    for (const entry of SERVICE_ICONS) {
        if (entry.keys.some(k => name.includes(k))) {
            return { icon: entry.icon, color: entry.color };
        }
    }
    return { icon: Home, color: 'text-slate-500' };
}

function formatArabicTime(timeStr: string) {
    if (!timeStr || !timeStr.includes('-')) return timeStr;
    const parts = timeStr.split('-');
    const formatPart = (t: string) => {
        const [hStr, mStr] = t.trim().split(':');
        if (!hStr || !mStr) return t;
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'مساءً' : 'صباحاً';
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
        return `${h.toString().padStart(2, '0')}:${mStr} ${ampm}`;
    };
    try {
        return `${formatPart(parts[0])} - ${formatPart(parts[1])}`;
    } catch {
        return timeStr;
    }
}

const DAY_NAMES_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

interface HomeCareService {
    id: number;
    name: string;
    description?: string;
    price?: string;
    duration?: number;
}

interface HomeCareProvider {
    id: number;
    clinic_name?: string;
    name?: string;
    clinic_specialty?: string;
    clinic_address?: string;
    clinic_phone?: string;
    clinic_logo?: string;
    clinic_description?: string;
    working_hours?: string;
    location_url?: string;
    avgRating?: number;
    totalReviews?: number;
    services?: HomeCareService[];
}

export default function PatientHomeCareDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [provider, setProvider] = useState<HomeCareProvider | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<HomeCareService | null>(null);

    // ── التقويم والحجز ──────────────────────────────────────────────────────────
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    
    const [bookingOpen, setBookingOpen] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (id) fetchProvider(parseInt(id));
    }, [id]);

    const fetchProvider = async (providerId: number) => {
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/home-care-providers/${providerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            setProvider(res.data);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل بيانات مزود الرعاية' });
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = useCallback(async (date: Date) => {
        if (!id) return;
        setLoadingSlots(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const token = localStorage.getItem('patient_token');
            const response = await axios.get(
                `${API_URL}/patient/home-care-providers/${id}/available-slots?date=${dateStr}`,
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

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot || !provider || !selectedService) return;

        if (!address.trim()) {
            toast({ variant: 'destructive', title: 'تنبيه', description: 'الرجاء إدخال عنوان الزيارة' });
            return;
        }

        setBookingLoading(true);
        try {
            const token = localStorage.getItem('patient_token');
            const [time, period] = selectedSlot.split(' ');
            const [hoursRaw, minutes] = time.split(':').map(Number);
            let hours = hoursRaw;
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const appointmentDate = new Date(selectedDate);
            appointmentDate.setHours(hours, minutes, 0, 0);

            const combinedNotes = `الخدمة: ${selectedService.name}\nالعنوان: ${address}\nالملاحظات: ${notes}`;

            await axios.post(
                `${API_URL}/patient/appointments`,
                {
                    clinicId: provider.id,
                    appointmentDate: appointmentDate.toISOString(),
                    notes: combinedNotes,
                    duration: selectedService.duration || 30,
                    type: 'home_care',
                    ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: '✅ تم حجز الزيارة المنزلية بنجاح!',
                description: `موعدك يوم ${format(selectedDate, 'EEEE dd MMMM', { locale: ar })} الساعة ${selectedSlot} — في انتظار التأكيد`,
            });

            setBookingOpen(false);
            setSelectedSlot(null);
            setNotes('');
            setAddress('');
            setCustomerName('');
            
            setTimeout(() => {
                navigate('/patient/appointments');
            }, 1000);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ في الحجز',
                description: err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب',
            });
        } finally {
            setBookingLoading(false);
        }
    };


    const handleCall = () => {
        const phone = provider?.clinic_phone || provider?.phone;
        if (phone) window.open(`tel:${phone}`, '_self');
    };

    const handleShare = async () => {
        const name = provider?.clinic_name || provider?.name || 'مزود رعاية منزلية';
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: name, url });
        } else {
            navigator.clipboard.writeText(url);
            toast({ title: '✅ تم نسخ الرابط' });
        }
    };

    const handleMap = () => {
        const { location_url, clinic_address } = provider || {};
        if (location_url) window.open(location_url, '_blank');
        else if (clinic_address) window.open(`https://maps.google.com/?q=${encodeURIComponent(clinic_address)}`, '_blank');
    };

    const logoSrc = () => {
        const raw = provider?.clinic_logo;
        if (!raw) return null;
        return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
    };

    const generateCalendarDays = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });
        const startDayIndex = getDay(start);
        const prefixDays = Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`prefix-${i}`} className="h-10 sm:h-12 w-full" />
        ));
        const today = startOfDay(new Date());

        return { prefixDays, days, today };
    };

    if (loading) {
        return (
            <div className="space-y-4 p-4 animate-fade-in">
                <Skeleton className="h-52 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!provider) return null;

    const displayName = provider.clinic_name || provider.name || 'مزود رعاية منزلية';
    const logo = logoSrc();
    const services = provider.services || [];
    const { prefixDays, days, today } = generateCalendarDays();

    return (
        <div className="pb-24 animate-fade-in" dir="rtl">
            {/* ── Hero Section ── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-violet-600 to-purple-600" />
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)'
                }} />
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='3' fill='white'/%3E%3C/svg%3E")`,
                }} />

                <button
                    onClick={() => navigate('/patient/clinics', { state: { activeTab: 'home' } })}
                    className="absolute top-4 right-4 z-10 flex items-center gap-1 text-white/90 hover:text-white font-bold text-sm bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full transition-all hover:bg-white/30"
                >
                    <ArrowRight className="w-4 h-4" />
                    رجوع
                </button>

                <button
                    onClick={handleShare}
                    className="absolute top-4 left-4 z-10 text-white/90 hover:text-white bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all hover:bg-white/30"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                <div className="relative z-10 px-5 pt-8 pb-6 text-white text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white/40 overflow-hidden bg-white/20 backdrop-blur-sm shadow-2xl">
                        {logo ? (
                            <img src={logo} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <HeartPulse className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-xl font-black mb-1 drop-shadow-md">{displayName}</h1>
                    {provider.clinic_specialty && (
                        <p className="text-indigo-200 text-xs font-medium mb-2">{provider.clinic_specialty}</p>
                    )}

                    {(provider.totalReviews ?? 0) > 0 && (
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(provider.avgRating || 0) ? 'fill-amber-300 text-amber-300' : 'fill-white/20 text-white/20'}`} />
                                ))}
                            </div>
                            <span className="text-white text-sm font-bold">{provider.avgRating}</span>
                            <span className="text-indigo-200 text-xs">({provider.totalReviews} تقييم)</span>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-2">
                        {provider.working_hours && (
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold">
                                <Clock className="w-3 h-3" />
                                {formatArabicTime(provider.working_hours)}
                            </span>
                        )}
                        {provider.clinic_address && (
                            <button
                                onClick={handleMap}
                                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold hover:bg-white/30 transition-all"
                            >
                                <MapPin className="w-3 h-3" />
                                <span className="max-w-[140px] truncate">{provider.clinic_address}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4 pt-4">
                {/* ── Action buttons ── */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={handleCall}
                        className="flex flex-col items-center gap-1.5 py-3 bg-green-500 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-green-600 active:scale-95 transition-all shadow-green-200"
                    >
                        <Phone className="w-5 h-5" />
                        اتصال
                    </button>
                    <button
                        onClick={() => navigate(`/patient/chat/${provider.id}`)}
                        className="flex flex-col items-center gap-1.5 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-indigo-600 active:scale-95 transition-all shadow-indigo-200"
                    >
                        <MessageCircle className="w-5 h-5" />
                        مراسلة
                    </button>
                    <button
                        onClick={handleMap}
                        className="flex flex-col items-center gap-1.5 py-3 bg-amber-500 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-amber-600 active:scale-95 transition-all shadow-amber-200"
                    >
                        <MapPin className="w-5 h-5" />
                        الموقع
                    </button>
                </div>

                {/* ── Description ── */}
                {provider.clinic_description && (
                    <Card className="border-indigo-100 shadow-sm">
                        <CardContent className="p-4">
                            <h2 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                                <HeartPulse className="w-4 h-4 text-indigo-500" />
                                عن مزود الرعاية
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">{provider.clinic_description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* ── Services List ── */}
                <div className="pb-4">
                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-indigo-500" />
                        اختر الخدمة المطلوبة
                    </h2>

                    {services.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 font-medium">لم يتم إضافة خدمات بعد</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {services.map((service) => {
                                const isSelected = selectedService?.id === service.id;
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(isSelected ? null : service)}
                                        className={`relative text-right w-full p-3 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                                            isSelected
                                                ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md shadow-indigo-200/50'
                                                : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                                        }`}
                                    >
                                        {/* Top row: icon + name + check */}
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const { icon: Icon, color } = getServiceIconConfig(service.name);
                                                return (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                                        isSelected ? 'bg-indigo-100' : 'bg-slate-50'
                                                    }`}>
                                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-500' : color}`} />
                                                    </div>
                                                );
                                            })()}
                                            <div className="flex-1 min-w-0 text-right">
                                                <p className="font-bold text-[13px] text-slate-800 leading-tight truncate">{service.name}</p>
                                                {service.description && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{service.description}</p>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                            )}
                                        </div>

                                        {/* Bottom row: price + duration as capsules */}
                                        {(service.price || service.duration) && (
                                            <div className="flex items-center gap-1.5 mt-2 pr-[52px]">
                                                {service.price && (
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                                        {service.price}
                                                    </span>
                                                )}
                                                {service.duration && (
                                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                                        {service.duration} دقيقة
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Booking Section (Calendar & Slots) ── */}
                {selectedService && (
                    <div className="space-y-6 animate-fade-in mt-6 border-t pt-6 border-slate-100">
                        <Card className="shadow-card border-indigo-100">
                            <CardHeader className="pb-3 px-4 pt-4 bg-indigo-50/30 border-b border-indigo-100/50">
                                <div className="flex flex-row items-center justify-between w-full">
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5 whitespace-nowrap m-0 p-0 text-indigo-800">
                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                        حدد الموعد
                                    </CardTitle>
                                    <div className="flex items-center gap-0.5" dir="ltr">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-indigo-600 hover:bg-indigo-100"
                                            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-bold min-w-[85px] text-center whitespace-nowrap text-indigo-900">
                                            {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-indigo-600 hover:bg-indigo-100"
                                            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[10px] sm:text-xs font-bold text-slate-400">
                                    {DAY_NAMES_AR.map(day => <div key={day}>{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                    {prefixDays}
                                    {days.map(date => {
                                        const isPast = startOfDay(date) < today;
                                        const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                                        const isTodayDate = isSameDay(date, today);
                                        return (
                                            <Button
                                                key={date.toString()}
                                                variant="ghost"
                                                disabled={isPast}
                                                onClick={() => handleSelectDate(date)}
                                                className={cn(
                                                    'h-10 sm:h-12 w-full p-0 flex flex-col items-center justify-center rounded-xl transition-all font-semibold',
                                                    isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300' :
                                                    isTodayDate ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                                                    isPast ? 'text-slate-300 opacity-50' : 'text-slate-700 hover:bg-slate-100'
                                                )}
                                            >
                                                <span className="text-xs sm:text-sm">{format(date, 'd')}</span>
                                            </Button>
                                        );
                                    })}
                                </div>

                                {selectedDate && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
                                        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-indigo-500" />
                                            الأوقات المتاحة
                                        </h4>
                                        {loadingSlots ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                                            </div>
                                        ) : slots.length > 0 ? (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1">
                                                {slots.map((slot, idx) => (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedSlot(slot);
                                                            setBookingOpen(true);
                                                        }}
                                                        className={cn(
                                                            'h-11 rounded-xl text-xs font-bold transition-all border-slate-200',
                                                            selectedSlot === slot 
                                                                ? 'bg-indigo-600 text-white border-transparent shadow-md' 
                                                                : 'hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 text-slate-600'
                                                        )}
                                                    >
                                                        {slot}
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-slate-500 text-sm font-medium">لا توجد مواعيد متاحة في هذا اليوم</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Booking Dialog */}
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-indigo-800 flex items-center gap-2">
                            <HeartPulse className="h-6 w-6 text-indigo-600" />
                            تأكيد الزيارة المنزلية
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-100">
                        <div className="flex items-start justify-between mb-2 pb-2 border-b border-indigo-100/50">
                            <div>
                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">التاريخ</p>
                                <p className="text-sm font-black text-slate-800">
                                    {selectedDate && format(selectedDate, 'EEEE, dd MMMM', { locale: ar })}
                                </p>
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">الوقت</p>
                                <p className="text-sm font-black text-slate-800">{selectedSlot}</p>
                            </div>
                        </div>
                        <div className="pt-1">
                            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">الخدمة المطلوبة</p>
                            <p className="text-sm font-bold text-indigo-700 flex items-center gap-1.5">
                                {selectedService && (() => {
                                    const { icon: Icon, color } = getServiceIconConfig(selectedService.name);
                                    return <Icon className={`w-4 h-4 ${color}`} />;
                                })()}
                                {selectedService?.name}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700">الاسم الكامل</Label>
                            <Input
                                id="name"
                                placeholder="اكتب اسم المريض"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address" className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                                عنوان الزيارة <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="address"
                                placeholder="مثال: عمّان، شارع الملك حسين، بناية رقم 15، الطابق الثاني..."
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="rounded-xl min-h-[70px] bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 resize-none"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes" className="text-sm font-bold text-slate-700">ملاحظات إضافية للمزود</Label>
                            <Textarea
                                id="notes"
                                placeholder="اذكر أي تفاصيل إضافية عن الحالة أو تعليمات للوصول..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="rounded-xl min-h-[70px] bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setBookingOpen(false)}
                            className="rounded-xl font-bold h-11 border-slate-200 text-slate-600 w-full sm:w-auto"
                        >
                            إلغاء
                        </Button>
                        <Button 
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading || !address.trim()}
                            className="rounded-xl font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto shadow-md"
                        >
                            {bookingLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'تأكيد الحجز'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
