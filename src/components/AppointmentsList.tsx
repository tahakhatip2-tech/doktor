
import { useState, useEffect } from 'react';
import { appointmentsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    MessageSquare,
    Trash2,
    MoreVertical,
    CheckCircle,
    Loader2,
    CalendarCheck,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CompleteAppointmentDialog from './CompleteAppointmentDialog';

interface AppointmentsListProps {
    onOpenChat: (phone: string) => void;
}

export default function AppointmentsList({ onOpenChat }: AppointmentsListProps) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

    const fetchAppointments = async () => {
        try {
            const data = await appointmentsApi.getAll();
            setAppointments(data);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            toastWithSound.error('فشل تحميل المواعيد');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

        setActionLoading(id);
        try {
            await appointmentsApi.delete(id);
            toastWithSound.success('تم حذف الموعد بنجاح');
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            toastWithSound.error('فشل في حذف الموعد');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStatusUpdate = async (id: number, status: string, appointment?: any) => {
        if (status === 'completed') {
            setSelectedApt(appointment);
            setIsCompleteDialogOpen(true);
            return;
        }

        setActionLoading(id);
        try {
            const updated = await appointmentsApi.updateStatus(id, status);

            if (updated && updated.status === status) {
                const statusMsg: Record<string, string> = {
                    confirmed: '✅ تم تأكيد الموعد وإشعار المريض',
                    cancelled: '❌ تم إلغاء الموعد وإشعار المريض',
                };
                toastWithSound.success(statusMsg[status] || 'تم تحديث حالة الموعد');
                setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            } else {
                toastWithSound.error('فشل في تحديث الحالة - يرجى المحاولة مرة أخرى');
            }
        } catch (error) {
            toastWithSound.error('فشل في تحديث الحالة');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 px-3 py-1 font-bold">بانتظار التأكيد</Badge>;
            case 'confirmed':
                return <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold">مؤكد</Badge>;
            case 'completed':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 font-bold">منجز</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 font-bold">ملغى</Badge>;
            default:
                return <Badge variant="outline" className="px-3 py-1">{status}</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 'بدون تاريخ' : format(d, 'dd MMM', { locale: ar });
        } catch { return 'بدون تاريخ'; }
    };

    const formatTime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? '--:--' : format(d, 'hh:mm a');
        } catch { return '--:--'; }
    };

    const formatFullDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? 'بدون تاريخ' : format(d, 'EEEE dd MMMM yyyy', { locale: ar });
        } catch { return 'بدون تاريخ'; }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                <p className="text-muted-foreground font-medium">جاري تحميل جدول المواعيد...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-4xl font-display font-black tracking-tight flex items-center gap-2 sm:gap-3">
                        جدول المواعيد
                        <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </h2>
                    <p className="text-sm sm:text-lg text-muted-foreground">إدارة الحجوزات من البوابة والموظف الذكي.</p>
                </div>
                <div className="bg-card/50 backdrop-blur-md border border-border/50 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-sm flex items-center gap-3 animate-slide-in-right self-start md:self-auto">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-bold">إجمالي الحجوزات</p>
                        <p className="text-base sm:text-xl font-black text-foreground leading-none">{appointments.length} موعد مسجل</p>
                    </div>
                </div>
            </div>

            {/* List/Table Container */}
            <Card className="border-none shadow-2xl bg-muted/20 overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                    <div className="relative w-full">
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {appointments.length === 0 ? (
                                <div className="text-center py-20 bg-card/40 rounded-2xl border border-dashed border-border/50">
                                    <Calendar className="h-12 w-12 text-primary/20 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-muted-foreground">لا توجد مواعيد حالياً</p>
                                </div>
                            ) : (
                                appointments.map((apt) => (
                                    <div key={apt.id} className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-1.5 h-full ${apt.status === 'pending' ? 'bg-yellow-500' : apt.status === 'confirmed' ? 'bg-primary' : apt.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}`} />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-foreground">
                                                        {apt.customerName || apt.patient_name || apt.customer_name || 'عميل'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-display" dir="ltr">
                                                        {(apt.phone || apt.chat_phone || '').split('@')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] py-2 border-y border-border/10">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <Calendar className="h-3.5 w-3.5 text-primary opacity-70" />
                                                {formatDate(apt.appointmentDate || apt.appointment_date || '')}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground font-bold">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatTime(apt.appointmentDate || apt.appointment_date || '')}
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-muted-foreground italic line-clamp-2 leading-relaxed">
                                            {apt.notes || 'تم الحجز عبر الموظف الذكي'}
                                        </p>

                                        {/* Quick Action Buttons for pending */}
                                        {apt.status === 'pending' && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg gap-1 text-[11px]"
                                                    onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                    disabled={actionLoading === apt.id}
                                                >
                                                    {actionLoading === apt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3.5 w-3.5" />}
                                                    تأكيد
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="flex-1 h-8 rounded-lg gap-1 text-[11px]"
                                                    onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                    disabled={actionLoading === apt.id}
                                                >
                                                    <ThumbsDown className="h-3.5 w-3.5" />
                                                    رفض
                                                </Button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 rounded-lg gap-2 text-[10px] bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10"
                                                onClick={() => onOpenChat(apt.phone)}
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                واتساب
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-lg p-0 border-border/50"
                                                        disabled={actionLoading === apt.id}
                                                    >
                                                        {actionLoading === apt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-2xl">
                                                    <DropdownMenuItem className="gap-2 focus:bg-green-500/10 focus:text-green-600 font-bold py-2.5 rounded-lg" onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>
                                                        <CheckCircle className="h-4 w-4" /> تأكيد الموعد
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 focus:bg-blue-500/10 focus:text-blue-600 font-bold py-2.5 rounded-lg" onClick={() => handleStatusUpdate(apt.id, 'completed', apt)}>
                                                        <CheckCircle2 className="h-4 w-4" /> تم الإنجاز
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 focus:bg-red-500/10 focus:text-red-600 font-bold py-2.5 rounded-lg" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>
                                                        <XCircle className="h-4 w-4" /> إلغاء الموعد
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-border my-1" />
                                                    <DropdownMenuItem className="gap-2 text-destructive focus:bg-red-50 py-2.5 rounded-lg" onClick={() => handleDelete(apt.id)}>
                                                        <Trash2 className="h-4 w-4" /> حذف الحجز نهائياً
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-auto">
                            <table className="w-full text-right" dir="rtl">
                                <thead>
                                    <tr className="bg-card/80 backdrop-blur-md border-b border-border/50 font-black">
                                        <th className="px-6 py-5 font-black text-muted-foreground text-sm uppercase tracking-wider">العميل</th>
                                        <th className="px-6 py-5 font-black text-muted-foreground text-sm uppercase tracking-wider">رقم الهاتف</th>
                                        <th className="px-6 py-5 font-black text-muted-foreground text-sm uppercase tracking-wider">التاريخ والوقت</th>
                                        <th className="px-6 py-5 font-black text-muted-foreground text-sm uppercase tracking-wider text-center">الحالة</th>
                                        <th className="px-6 py-5 font-black text-muted-foreground text-sm uppercase tracking-wider">ملاحظات</th>
                                        <th className="px-6 py-5 font-black text-muted-foreground text-sm uppercase tracking-wider text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-24 text-center">
                                                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                                        <Calendar className="h-24 w-24 text-primary relative z-10 opacity-80" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-2xl font-black text-foreground">لا توجد مواعيد حالياً</p>
                                                        <p className="text-muted-foreground max-w-sm mx-auto">ستظهر هنا المواعيد التي يتم تأكيدها آلياً عبر الموظف الذكي أو التي تضيفها يدوياً.</p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-full px-8 border-primary/20 hover:bg-primary/5 font-bold"
                                                        onClick={() => fetchAppointments()}
                                                    >
                                                        تحديث البيانات
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.map((apt) => (
                                            <tr key={apt.id} className="group hover:bg-card/40 transition-all duration-300">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                            <User className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground">
                                                                {apt.customerName || apt.patient_name || apt.customer_name || 'عميل'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 group-hover:text-primary transition-colors font-display text-sm tracking-wide" dir="ltr">
                                                        {(apt.phone || apt.chat_phone || '').split('@')[0]}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 font-bold text-sm">
                                                            <Calendar className="h-4 w-4 text-primary opacity-70" />
                                                            {formatFullDate(apt.appointmentDate || apt.appointment_date || '')}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {formatTime(apt.appointmentDate || apt.appointment_date || '')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {getStatusBadge(apt.status)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px] line-clamp-2 italic">
                                                        {apt.notes || 'تم الحجز عبر الموظف الذكي'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Quick Confirm/Reject for pending */}
                                                        {apt.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg gap-1.5 text-xs font-bold px-3"
                                                                    onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                                                    disabled={actionLoading === apt.id}
                                                                    title="تأكيد الموعد"
                                                                >
                                                                    <ThumbsUp className="h-3.5 w-3.5" />
                                                                    تأكيد
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-8 rounded-lg gap-1.5 text-xs font-bold px-3"
                                                                    onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                                                    disabled={actionLoading === apt.id}
                                                                    title="رفض الموعد"
                                                                >
                                                                    <ThumbsDown className="h-3.5 w-3.5" />
                                                                    رفض
                                                                </Button>
                                                            </>
                                                        )}

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all active:scale-90"
                                                            onClick={() => onOpenChat(apt.phone)}
                                                            title="رد سريع واتساب"
                                                        >
                                                            <MessageSquare className="h-5 w-5" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                                                                    disabled={actionLoading === apt.id}
                                                                >
                                                                    {actionLoading === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-5 w-5" />}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start" className="w-44 rounded-xl border-border/50">
                                                                <DropdownMenuItem className="gap-2 focus:bg-green-500/10 focus:text-green-600 font-bold" onClick={() => handleStatusUpdate(apt.id, 'confirmed')}>
                                                                    <CheckCircle className="h-4 w-4" /> تأكيد الموعد
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2 focus:bg-blue-500/10 focus:text-blue-600 font-bold" onClick={() => handleStatusUpdate(apt.id, 'completed', apt)}>
                                                                    <CheckCircle2 className="h-4 w-4" /> تم الإنجاز
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2 focus:bg-red-500/10 focus:text-red-600 font-bold" onClick={() => handleStatusUpdate(apt.id, 'cancelled')}>
                                                                    <XCircle className="h-4 w-4" /> إلغاء الموعد
                                                                </DropdownMenuItem>
                                                                <div className="h-px bg-border my-1" />
                                                                <DropdownMenuItem className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive font-bold" onClick={() => handleDelete(apt.id)}>
                                                                    <Trash2 className="h-4 w-4" /> حذف الحجز
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <CompleteAppointmentDialog
                isOpen={isCompleteDialogOpen}
                onClose={() => {
                    setIsCompleteDialogOpen(false);
                    setSelectedApt(null);
                }}
                appointment={selectedApt}
                onSuccess={() => {
                    fetchAppointments();
                }}
            />
        </div>
    );
}
