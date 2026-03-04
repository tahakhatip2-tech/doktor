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
import {
    Building2,
    MapPin,
    Phone,
    Clock,
    ArrowRight,
    Calendar,
    MessageCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { format, startOfDay, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// â”€â”€â”€ الأظٹام باللط؛ة العربظٹة â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DAY_NAMES_AR = ['أحد', 'اثنظٹن', 'ثلاثاط،', 'أربعاط،', 'خمظٹس', 'جمعة', 'سبطھ'];

export default function PatientClinicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [clinic, setClinic] = useState<any>(null);
    const [loadingClinic, setLoadingClinic] = useState(true);

    // â”€â”€ الطھقظˆظٹم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ جلب بظٹاناطھ العظٹادة â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        const fetchClinic = async () => {
            try {
                const token = localStorage.getItem('patient_token');
                const response = await axios.get(`${API_URL}/patient/clinics/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setClinic(response.data);
            } catch {
                toast({ variant: 'destructive', title: 'خطأ', description: 'لم ظٹطھم العثظˆر على العظٹادة' });
                navigate('/patient/clinics');
            } finally {
                setLoadingClinic(false);
            }
        };
        if (id) fetchClinic();
    }, [id]);

    // â”€â”€ جلب الـ Slots عند اخطھظٹار ظٹظˆم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            toast({ variant: 'destructive', title: 'خطأ', description: 'طھعذر طھحمظٹل المظˆاعظٹد المطھاحة' });
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

            // بناط، الطھارظٹخ ظˆالظˆقطھ الظƒامل
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
                title: 'âœ… طھم إرسال طلب الحجز!',
                description: `مظˆعدظƒ ظٹظˆم ${format(selectedDate, 'EEEE dd MMMM', { locale: ar })} الساعة ${selectedSlot} â€” ظپظٹ انطھظار طھأظƒظٹد الطبظٹب`,
            });

            setBookingOpen(false);
            setSelectedSlot(null);
            setNotes('');
            // إعادة جلب الـ slots لطھحدظٹث المطھاح
            fetchSlots(selectedDate);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ ظپظٹ الحجز',
                description: err.response?.data?.message || 'حدث خطأ أثناط، إرسال الطلب',
            });
        } finally {
            setBookingLoading(false);
        }
    };

    // â”€â”€ بناط، أظٹام الطھقظˆظٹم â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">

            {/* â”€â”€ زر الرجظˆع â”€â”€ */}
            <Button
                variant="ghost"
                onClick={() => navigate('/patient/clinics')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowRight className="h-4 w-4" />
                العظˆدة إلى العظٹاداطھ
            </Button>

            {/* â”€â”€ بطاقة معلظˆماطھ العظٹادة â”€â”€ */}
            <Card className="shadow-card overflow-hidden">
                <div className="h-3 gradient-primary" />
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                                <Building2 className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{clinic.clinic_name || clinic.name}</CardTitle>
                                {clinic.clinic_specialty && (
                                    <Badge variant="secondary" className="mt-1">{clinic.clinic_specialty}</Badge>
                                )}
                            </div>
                        </div>
                        {/* أزرار التواصل — واتساب + مراسلة داخلية */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* ✅ زر واتساب — يبقى كما هو للتواصل الخارجي */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-500 hover:text-white transition-colors gap-2"
                                onClick={() => {
                                    const phone = (clinic.clinic_phone || clinic.phone)?.replace(/\D/g, '');
                                    if (phone) window.open(`https://wa.me/${phone}`, '_blank');
                                }}
                            >
                                <MessageCircle className="h-4 w-4" />
                                واتساب
                            </Button>

                            {/* ✅ زر مراسلة داخلية جديد — يفتح شات المريض */}
                            <Button
                                size="sm"
                                className="gap-2 gradient-primary text-white shadow-glow"
                                onClick={() => navigate(`/patient/chat/${clinic.id}`)}
                            >
                                <MessageCircle className="h-4 w-4" />
                                مراسلة العيادة
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {clinic.clinic_address && (
                            <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
                                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">العنظˆان</p>
                                    <p className="text-sm font-medium">{clinic.clinic_address}</p>
                                </div>
                            </div>
                        )}
                        {(clinic.clinic_phone || clinic.phone) && (
                            <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
                                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">الهاطھظپ</p>
                                    <p className="text-sm font-medium" dir="ltr">{clinic.clinic_phone || clinic.phone}</p>
                                </div>
                            </div>
                        )}
                        {clinic.working_hours && (
                            <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
                                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">ساعاطھ العمل</p>
                                    <p className="text-sm font-medium">{clinic.working_hours}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* â”€â”€ قسم الحجز â”€â”€ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* الطھقظˆظٹم */}
                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                اخطھر الظٹظˆم
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
                        {/* رؤظˆس الأظٹام */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAY_NAMES_AR.map(d => (
                                <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">
                                    {d}
                                </div>
                            ))}
                        </div>
                        {/* أظٹام الشهر */}
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
                            المظˆاعظٹد المطھاحة
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
                                <p className="text-muted-foreground">اخطھر ظٹظˆماً من الطھقظˆظٹم لعرض المظˆاعظٹد المطھاحة</p>
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
                                <p className="text-muted-foreground font-medium">لا طھظˆجد مظˆاعظٹد مطھاحة</p>
                                <p className="text-muted-foreground text-sm mt-1">ظٹرجى اخطھظٹار ظٹظˆم آخر</p>
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

                                {/* زر طھأظƒظٹد الحجز */}
                                <Button
                                    className="w-full gradient-primary text-white shadow-glow gap-2"
                                    disabled={!selectedSlot}
                                    onClick={() => setBookingOpen(true)}
                                >
                                    <Calendar className="h-4 w-4" />
                                    {selectedSlot
                                        ? `احجز الساعة ${selectedSlot}`
                                        : 'اخطھر مظˆعداً للمطھابعة'
                                    }
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* â”€â”€ Dialog طھأظƒظٹد الحجز â”€â”€ */}
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            طھأظƒظٹد الحجز
                        </DialogTitle>
                        <DialogDescription>
                            راجع طھظپاصظٹل مظˆعدظƒ قبل الطھأظƒظٹد
                        </DialogDescription>
                    </DialogHeader>

                    {/* ملخص المظˆعد */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3 border">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">العظٹادة</p>
                                <p className="font-semibold">{clinic.clinic_name || clinic.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">الطھارظٹخ</p>
                                <p className="font-semibold">
                                    {selectedDate && format(selectedDate, 'EEEEطŒ dd MMMM yyyy', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">الظˆقطھ</p>
                                <p className="font-semibold">{selectedSlot}</p>
                            </div>
                        </div>
                    </div>

                    {/* ملاحظاطھ */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظاطھ للطبظٹب (اخطھظٹارظٹ)</Label>
                        <Textarea
                            id="notes"
                            placeholder="أضظپ أظٹ طھظپاصظٹل طھساعد الطبظٹب ظپظٹ الاسطھعداد لزظٹارطھظƒ..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* حجز لشخص آخر (جدظٹد) */}
                    <div className="space-y-2">
                        <Label htmlFor="customerName">اسم المرظٹض (إذا ظƒنطھ طھحجز لشخص آخر)</Label>
                        <Input
                            id="customerName"
                            placeholder="اخطھظٹارظٹ - اطھرظƒ الحقل ظپارط؛اً إذا ظƒان الحجز لظƒ"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        سظٹطھم إرسال طلب المظˆعد إلى الطبظٹب ظˆسطھظڈشعظژر عند الطھأظƒظٹد.
                    </p>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBookingOpen(false)}
                            disabled={bookingLoading}
                            className="flex-1"
                        >
                            إلط؛اط،
                        </Button>
                        <Button
                            className="flex-1 gradient-primary text-white"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? (
                                <><Loader2 className="h-4 w-4 ml-2 animate-spin" />جارظٹ الحجز...</>
                            ) : (
                                'طھأظƒظٹد الحجز'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
