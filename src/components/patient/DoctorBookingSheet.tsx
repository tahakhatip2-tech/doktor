import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Stethoscope, Star, Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const DAY_NAMES_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

interface DoctorBookingSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: any;
    clinic: any;
    onBookingComplete: () => void;
}

export default function DoctorBookingSheet({ open, onOpenChange, doctor, clinic, onBookingComplete }: DoctorBookingSheetProps) {
    const { toast } = useToast();
    
    // Calendar & Slots State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Booking State
    const [step, setStep] = useState<'calendar' | 'confirm'>('calendar');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        if (!open) {
            setStep('calendar');
            setSelectedDate(null);
            setSlots([]);
            setSelectedSlot(null);
            setNotes('');
            setCustomerName('');
        }
    }, [open]);

    // Parse Doctor Working Days
    const allowedDays = (() => {
        if (!doctor?.workingDays) return null; // If null, allow all days
        const dayNamesAr: Record<string, number> = {
            'أحد': 0, 'احد': 0, 'sunday': 0,
            'اثنين': 1, 'الاثنين': 1, 'monday': 1,
            'ثلاثاء': 2, 'الثلاثاء': 2, 'tuesday': 2,
            'أربعاء': 3, 'اربعاء': 3, 'الأربعاء': 3, 'wednesday': 3,
            'خميس': 4, 'الخميس': 4, 'thursday': 4,
            'جمعة': 5, 'الجمعة': 5, 'friday': 5,
            'سبت': 6, 'السبت': 6, 'saturday': 6,
        };
        const parts = doctor.workingDays.split(/[,،\-\s]+/).map((p: string) => p.trim().toLowerCase()).filter(Boolean);
        const days = parts.map((p: string) => dayNamesAr[p]).filter((d: number) => d !== undefined);
        return days.length > 0 ? days : null;
    })();

    // Helper: generate days for calendar
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        const startPadding = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
        
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    // Check if dates are the same
    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    };

    const fetchSlots = useCallback(async (date: Date) => {
        if (!doctor || !clinic) return;
        setLoadingSlots(true);
        setSlots([]);
        setSelectedSlot(null);
        try {
            const token = localStorage.getItem('patient_token');
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await axios.get(
                `${API_URL}/patient/clinics/${clinic.id}/doctors/${doctor.id}/available-slots?date=${dateStr}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSlots(response.data.slots || []);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر تحميل المواعيد المتاحة للطبيب' });
        } finally {
            setLoadingSlots(false);
        }
    }, [doctor, clinic, toast]);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        fetchSlots(date);
    };

    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot || !clinic || !doctor) return;
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

            await axios.post(
                `${API_URL}/patient/appointments`,
                {
                    clinicId: clinic.id,
                    appointmentDate: appointmentDate.toISOString(),
                    notes,
                    duration: doctor.patientDuration || 30, // Uses doctor's patientDuration!
                    type: 'consultation',
                    isVideo: false,
                    clinicDoctorId: doctor.id,
                    ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: '✅ تم إرسال طلب الحجز!',
                description: `موعدك مع د. ${doctor.name} يوم ${format(selectedDate, 'EEEE dd MMMM', { locale: ar })} الساعة ${selectedSlot}`,
            });
            
            onBookingComplete();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ في الحجز',
                description: err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب',
            });
            setBookingLoading(false);
        }
    };

    if (!doctor) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 border border-slate-200/60 bg-slate-50/90 backdrop-blur-3xl rounded-[2rem] shadow-2xl" dir="rtl">
                
                {/* 🌟 Premium Header */}
                <div className="bg-gradient-to-b from-white to-slate-50 p-8 pb-10 rounded-b-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10 border-b border-slate-200/50">
                    
                    {/* Clinic Info at Top */}
                    {clinic && (
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800">{clinic.name}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin className="h-3 w-3" />
                                        {clinic.address || 'عنوان العيادة غير متوفر'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Doctor Info */}
                    <div className="flex items-center gap-5">
                        <div className="h-24 w-24 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-lg overflow-hidden relative group">
                            {doctor.avatar ? (
                                <img src={doctor.avatar} alt={doctor.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <Stethoscope className="h-10 w-10 text-primary/40" />
                            )}
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="pt-1">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                {doctor.name?.includes('د.') || doctor.name?.startsWith('د ') ? doctor.name : `د. ${doctor.name}`}
                            </h2>
                            <p className="text-primary font-bold text-sm mt-1">{doctor.specialty || 'طبيب عام'}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                                {doctor.experienceYears && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                        خبرة {doctor.experienceYears} سنوات
                                    </span>
                                )}
                                {doctor.workingHours && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 shadow-sm">
                                        <Clock className="h-3.5 w-3.5" />
                                        {doctor.workingHours}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {step === 'calendar' ? (
                        <div className="space-y-6">
                            {/* Calendar section */}
                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                                        <Calendar className="h-6 w-6 text-primary" />
                                        حدد موعد الزيارة
                                    </h3>
                                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100">
                                        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                        <span className="text-sm font-bold w-24 text-center text-slate-700">
                                            {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                                        </span>
                                        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                    {DAY_NAMES_AR.map(day => (
                                        <div key={day} className="text-xs font-black text-slate-400 mb-2">{day}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {getDaysInMonth(currentMonth).map((day, i) => {
                                        if (!day) return <div key={i} className="aspect-square" />;
                                        
                                        const isPast = day < new Date(new Date().setHours(0,0,0,0));
                                        const dayOfWeek = day.getDay();
                                        const isAllowed = allowedDays ? allowedDays.includes(dayOfWeek) : true;
                                        const disabled = isPast || !isAllowed;
                                        const isSelected = selectedDate && isSameDay(day, selectedDate);

                                        return (
                                            <button
                                                key={i}
                                                disabled={disabled}
                                                onClick={() => handleSelectDate(day)}
                                                className={cn(
                                                    'aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 relative overflow-hidden group',
                                                    disabled ? 'opacity-30 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-100 hover:shadow-sm',
                                                    isSelected ? 'bg-primary text-white shadow-md shadow-primary/30 transform scale-105' : 'text-slate-700'
                                                )}
                                            >
                                                <span className="relative z-10">{day.getDate()}</span>
                                                {isSelected && (
                                                    <span className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Slots section */}
                            {selectedDate && (
                                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                                            <Clock className="h-6 w-6 text-orange-500" />
                                            الأوقات المتاحة
                                        </h3>
                                        <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                                            {format(selectedDate, 'dd MMMM', { locale: ar })}
                                        </div>
                                    </div>
                                    
                                    {loadingSlots ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {[...Array(8)].map((_, i) => (
                                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                            ))}
                                        </div>
                                    ) : slots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {slots.map((slot, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={cn(
                                                        'h-12 rounded-xl text-sm font-bold transition-all duration-300 border-2',
                                                        selectedSlot === slot
                                                            ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm shadow-orange-500/20 transform scale-105'
                                                            : 'bg-white border-slate-100 text-slate-600 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-600 hover:-translate-y-0.5'
                                                    )}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                                            <p className="text-slate-500 text-sm font-medium">لا توجد مواعيد متاحة في هذا اليوم</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button
                                className="w-full rounded-2xl h-12 bg-primary text-white shadow-lg shadow-primary/25 text-base font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none"
                                disabled={!selectedSlot}
                                onClick={() => setStep('confirm')}
                            >
                                {selectedSlot ? `المتابعة للحجز الساعة ${selectedSlot}` : 'اختر موعداً للمتابعة'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    مراجعة بيانات الحجز
                                </h3>
                                <p className="text-sm text-slate-600 mb-1">
                                    <strong>الطبيب:</strong> د. {doctor.name}
                                </p>
                                <p className="text-sm text-slate-600">
                                    <strong>الوقت:</strong> يوم {selectedDate && format(selectedDate, 'EEEE dd MMMM', { locale: ar })} الساعة {selectedSlot}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600">اسم المريض (إذا كان لغيرك)</Label>
                                    <Input
                                        placeholder="اتركه فارغاً إذا كان الحجز لك"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="h-12 rounded-xl bg-white border-slate-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-600">ملاحظات للطبيب</Label>
                                    <Textarea
                                        placeholder="اكتب أي تفاصيل تود إعلام الطبيب بها..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="min-h-[100px] resize-none rounded-xl bg-white border-slate-200 p-4"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-1/3 rounded-xl h-12 font-bold"
                                    onClick={() => setStep('calendar')}
                                    disabled={bookingLoading}
                                >
                                    رجوع
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl h-12 bg-primary text-white shadow-lg shadow-primary/25 font-bold"
                                    onClick={handleConfirmBooking}
                                    disabled={bookingLoading}
                                >
                                    {bookingLoading ? 'جاري التأكيد...' : 'تأكيد الحجز النهائي'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
