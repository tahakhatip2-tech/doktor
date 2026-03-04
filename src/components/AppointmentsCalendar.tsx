import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, FileText, Plus, Filter, MessageCircle, CheckCircle2, Bot, PenTool } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toastWithSound } from '@/lib/toast-with-sound';
import { appointmentsApi, dataApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import AddAppointmentDialog from './AddAppointmentDialog';
import CompleteAppointmentDialog from './CompleteAppointmentDialog';

interface Appointment {
    id: number;
    patient_name?: string; // Legacy
    customerName?: string; // New
    patient_name_new?: string; // Fallback helper if needed
    phone: string;
    appointment_date?: string; // Legacy
    appointmentDate?: string; // New
    duration: number;
    appointment_type?: string; // Legacy
    type?: string; // New
    appointmentType?: string; // Just in case
    status: string;
    notes: string;
    doctor_name?: string;
    doctorName?: string;
}

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    scheduled: { label: 'محجوز', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    confirmed: { label: 'مؤكد', color: 'bg-primary/10 text-primary border-primary/20' },
    completed: { label: 'مكتمل', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    'no-show': { label: 'لم يحضر', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
};

const typeConfig = {
    consultation: 'استشارة',
    checkup: 'فحص دوري',
    followup: 'متابعة',
    emergency: 'طارئ',
    general: 'عام',
};

interface AppointmentsCalendarProps {
    onOpenChat?: (phone: string) => void;
}

export default function AppointmentsCalendar({ onOpenChat }: AppointmentsCalendarProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'pending_requests'>('today');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, [filter]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            let data;

            if (filter === 'today') {
                const today = new Date().toISOString().split('T')[0];
                data = await dataApi.get(`/appointments?date_from=${today}&date_to=${today}`);
            } else if (filter === 'week') {
                const today = new Date();
                const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                data = await dataApi.get(`/appointments?date_from=${today.toISOString()}&date_to=${weekLater.toISOString()}`);
            } else if (filter === 'pending_requests') {
                data = await dataApi.get(`/appointments?status=pending`);
            } else {
                data = await appointmentsApi.getAll();
            }

            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
            toastWithSound.error('فشل تحميل المواعيد');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string, appointment?: any) => {
        if (newStatus === 'completed') {
            setSelectedApt(appointment);
            setIsCompleteDialogOpen(true);
            return;
        }

        try {
            if (appointment?.status === 'pending' && newStatus === 'confirmed') {
                await appointmentsApi.confirm(id);
                toastWithSound.success('تم تأكيد طلب الحجز وإشعار المريض');
            } else if (appointment?.status === 'pending' && newStatus === 'cancelled') {
                await appointmentsApi.reject(id, 'تم الرفض من الطبيب');
                toastWithSound.success('تم رفض طلب الحجز وإشعار المريض');
            } else {
                await appointmentsApi.update(id, { status: newStatus });
                toastWithSound.success('تم تحديث حالة الموعد');
            }
            loadAppointments();
        } catch (error) {
            console.error('Error updating status:', error);
            toastWithSound.error('فشل تحديث الحالة');
        }
    };

    const filteredAppointments = statusFilter === 'all'
        ? appointments
        : appointments.filter(apt => apt.status === statusFilter);

    const groupedByDate = filteredAppointments.reduce((acc, apt) => {
        const dateRaw = apt.appointmentDate || apt.appointment_date;
        if (!dateRaw) return acc;

        try {
            const dateObj = new Date(dateRaw);
            if (isNaN(dateObj.getTime())) return acc;

            const date = dateObj.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(apt);
        } catch (e) {
            console.error('Invalid date for appointment:', apt.id, dateRaw);
        }
        return acc;
    }, {} as Record<string, Appointment[]>);

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-3xl font-black text-foreground flex items-center gap-2">
                        <Calendar className="h-8 w-8 text-blue-500" />
                        المواعيد
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider pl-1 border-l-2 border-blue-500/30">
                        إدارة وتتبع مواعيد المرضى اليومية والأسبوعية
                    </p>
                </div>
                <Button
                    className="gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] rounded-none h-10 px-6 font-bold transition-all hover:scale-105 text-xs uppercase tracking-wider group relative overflow-hidden"
                    onClick={() => setIsAddDialogOpen(true)}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    <span className="relative z-10">حجز موعد جديد</span>
                </Button>
            </div>

            <AddAppointmentDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={loadAppointments}
                onOpenChat={onOpenChat}
            />

            {/* Blue Glass Control Bar (Filters) */}
            <Card className="p-2 bg-blue-600/5 border border-blue-500/10 backdrop-blur-md rounded-none shadow-sm flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/20" />

                <div className="flex-1 flex flex-wrap items-center gap-6 px-2">
                    {/* Period Filter */}
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-sm bg-blue-500/10 text-blue-500">
                            <Filter className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-foreground/70 uppercase tracking-wider">الفترة :</span>
                        <div className="flex gap-1 p-0.5 bg-background/40 rounded-sm border border-white/5">
                            {[
                                { id: 'today', label: 'اليوم' },
                                { id: 'week', label: 'الأسبوع' },
                                { id: 'pending_requests', label: 'الطلبات' },
                                { id: 'all', label: 'الكل' }
                            ].map((item) => (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilter(item.id as any)}
                                    className={cn(
                                        "h-7 px-3 rounded-none text-[10px] font-bold transition-all border border-transparent",
                                        filter === item.id
                                            ? "bg-white shadow-sm text-blue-600 border-black/5 dark:bg-white/10 dark:text-blue-400"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/10 hidden md:block" />

                    {/* Status Filter */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-foreground/70 uppercase tracking-wider">الحالة :</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-8 text-[11px] font-bold border border-white/10 rounded-none px-3 bg-white/5 text-foreground focus:border-blue-500/50 outline-none w-32 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <option value="all" className="bg-background">الكل</option>
                            <option value="pending" className="bg-background">قيد الانتظار</option>
                            <option value="scheduled" className="bg-background">محجوز</option>
                            <option value="confirmed" className="bg-background">مؤكد</option>
                            <option value="completed" className="bg-background">مكتمل</option>
                            <option value="cancelled" className="bg-background">ملغي</option>
                            <option value="no-show" className="bg-background">لم يحضر</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Professional Divider */}
            <div className="w-full flex items-center justify-center gap-4 my-2 opacity-80">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
            </div>

            {/* Appointments List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-none border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-4 w-4 bg-blue-500/20 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">جاري تحميل الجدول...</p>
                </div>
            ) : Object.keys(groupedByDate).length === 0 ? (
                <Card className="py-20 text-center bg-blue-950/5 border-dashed border-white/10 rounded-none">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground/20 mb-6" strokeWidth={1} />
                    <h3 className="text-xl font-black text-foreground mb-2">لا توجد مواعيد</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        لم يتم العثور على مواعيد في الفترة المحددة
                    </p>
                </Card>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedByDate).map(([date, dayAppointments]) => (
                        <div key={date} className="relative">
                            {/* Date Sticky Header */}
                            <div className="flex items-center gap-4 mb-4 sticky top-0 z-20 py-3 bg-background/80 backdrop-blur-md border-b border-white/5">
                                <div className="h-8 w-1 bg-blue-500" />
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    {format(new Date(date), 'EEEE، d MMMM yyyy', { locale: ar })}
                                </h3>
                                <div className="mr-auto px-3 py-1 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                                    {dayAppointments.length} مواعيد
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dayAppointments.map((appointment) => (
                                    <Card
                                        key={appointment.id}
                                        className="group relative overflow-hidden p-0 bg-blue-950/5 border border-white/10 backdrop-blur-md rounded-none hover:border-blue-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/5"
                                    >
                                        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 hover:w-1.5 transition-all duration-300" />

                                        <div className="p-4 flex flex-col gap-4">
                                            {/* Top Row: Info & Status */}
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <div className="h-10 w-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-black text-sm text-foreground leading-tight mb-1 truncate">
                                                            {(() => {
                                                                const name = appointment.customerName || appointment.patient_name;
                                                                if (!name || name === 'Unspecified') return 'غير محدد';
                                                                return name;
                                                            })()}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium font-mono">
                                                            <Phone className="h-2.5 w-2.5 opacity-70" />
                                                            <a href={`tel:${appointment.phone}`} className="hover:text-blue-500 transition-colors truncate block">
                                                                {appointment.phone.split('@')[0]}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-sm text-[9px] font-black border uppercase tracking-wide self-start sm:self-auto",
                                                    statusConfig[appointment.status as keyof typeof statusConfig]?.color
                                                )}>
                                                    {statusConfig[appointment.status as keyof typeof statusConfig]?.label}
                                                </div>
                                            </div>

                                            {/* Middle Row: Time & Type */}
                                            <div className="flex items-center justify-between p-2 rounded-sm bg-black/5 dark:bg-white/5 border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-500">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="tabular-nums mt-0.5">
                                                            {format(new Date(appointment.appointmentDate || appointment.appointment_date || ""), 'hh:mm a', { locale: ar })}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 w-px bg-white/10" />
                                                    <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                                                        <span>{typeConfig[(appointment.type || appointment.appointment_type) as keyof typeof typeConfig] || 'عام'}</span>

                                                        {/* Source Indicator */}
                                                        {((appointment.notes || '').includes('[BOT]') || (appointment.notes || '').toLowerCase().includes('ai generated')) ? (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px]">
                                                                <Bot className="h-3 w-3" />
                                                                <span>آلي</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-500/10 text-gray-600 border border-gray-500/20 text-[9px] opacity-70">
                                                                <PenTool className="h-3 w-3" />
                                                                <span>يدوي</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 rounded-sm text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                                                    title="فتح المحادثة"
                                                    onClick={() => {
                                                        if (appointment.phone) {
                                                            if (onOpenChat) {
                                                                onOpenChat(appointment.phone);
                                                            } else {
                                                                toastWithSound.error('خدمة الدردشة غير متاحة');
                                                            }
                                                        } else {
                                                            toastWithSound.error('رقم الهاتف غير صالح');
                                                        }
                                                    }}
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>

                                            {/* Notes if any */}
                                            {(appointment.notes || appointment.notes === '') && (
                                                <div className="bg-orange-500/5 border-r-2 border-orange-500/30 px-2 py-1.5 text-[10px] text-muted-foreground italic line-clamp-2 text-right">
                                                    {(() => {
                                                        const noteRaw = appointment.notes || '';
                                                        const noteLower = noteRaw.toLowerCase().trim();

                                                        // Filter out system tags for display
                                                        const cleanNote = noteRaw.replace('[BOT]', '').replace('AI Generated Appointment', '').trim();

                                                        if (!cleanNote || cleanNote === 'notes' || cleanNote === 'null') return 'لا توجد ملاحظات إضافية';

                                                        // If it was JUST the tag, show specific message or nothing
                                                        if (cleanNote === '') return 'تم الحجز آلياً عبر واتساب';

                                                        return cleanNote;
                                                    })()}
                                                </div>
                                            )}

                                            {/* Actions Footer */}
                                            <div className="pt-2 mt-auto border-t border-white/5 flex gap-2">
                                                {(appointment.status === 'scheduled' || appointment.status === 'pending') && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="flex-1 h-7 text-[10px] font-bold rounded-sm bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/10 hover:border-blue-500 transition-all uppercase tracking-wide"
                                                            onClick={() => updateStatus(appointment.id, 'confirmed', appointment)}
                                                        >
                                                            تأكيد
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="flex-1 h-7 text-[10px] font-bold rounded-sm bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/10 hover:border-red-500 transition-all uppercase tracking-wide"
                                                            onClick={() => updateStatus(appointment.id, 'cancelled', appointment)}
                                                        >
                                                            إلغاء
                                                        </Button>
                                                    </>
                                                )}
                                                {appointment.status === 'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        className="w-full h-8 text-[10px] font-bold rounded-sm bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-500/20 transition-all uppercase tracking-wider relative group/btn overflow-hidden"
                                                        onClick={() => updateStatus(appointment.id, 'completed', appointment)}
                                                    >
                                                        <span className="absolute inset-0 bg-orange-500/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                                            تسجيل إتمام الكشف
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        </span>
                                                    </Button>
                                                )}
                                                {['completed', 'cancelled', 'no-show'].includes(appointment.status) && (
                                                    <div className="hidden group-hover:block w-full text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="w-full h-7 text-[10px] text-muted-foreground hover:text-foreground"
                                                            onClick={() => updateStatus(appointment.id, 'scheduled')} // Re-open fallback
                                                        >
                                                            إعادة فتح الموعد
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CompleteAppointmentDialog
                isOpen={isCompleteDialogOpen}
                onClose={() => {
                    setIsCompleteDialogOpen(false);
                    setSelectedApt(null);
                }}
                appointment={selectedApt}
                onSuccess={() => {
                    loadAppointments();
                }}
            />
        </div>
    );
}
