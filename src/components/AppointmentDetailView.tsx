import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowRight,
    Calendar,
    Clock,
    User,
    Phone,
    FileText,
    MessageCircle,
    CheckCircle2,
    XCircle,
    Activity,
    Pill,
    Bot,
    PenTool,
    Stethoscope,
    Hash,
    Droplet,
    IdCard,
    Save,
    FastForward,
    TestTube,
    Syringe,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toastWithSound } from '@/lib/toast-with-sound';
import { appointmentsApi } from '@/lib/api';
import HeroSection from './HeroSection';
import CompleteAppointmentDialog from './CompleteAppointmentDialog';

interface AppointmentDetailViewProps {
    appointment: any;
    onBack: () => void;
    onOpenChat?: (phone: string) => void;
    onSuccess?: () => void;
}

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    scheduled: { label: 'محجوز', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    confirmed: { label: 'مؤكد', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
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

export default function AppointmentDetailView({
    appointment,
    onBack,
    onOpenChat,
    onSuccess
}: AppointmentDetailViewProps) {
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Procedures State
    const [proceduresData, setProceduresData] = useState({
        initialTests: appointment.initialTests || '',
        medicalProcedures: appointment.medicalProcedures || '',
    });
    const [savingProcedures, setSavingProcedures] = useState(false);
    const [proceduresSaved, setProceduresSaved] = useState(!!(appointment.initialTests || appointment.medicalProcedures));

    const appointmentDate = new Date(appointment.appointmentDate || appointment.appointment_date);
    const patientName = appointment.customerName || appointment.patient_name || 'غير محدد';
    const appointmentType = appointment.type || appointment.appointment_type || 'general';
    const isAutoBooked = (appointment.notes || '').includes('[BOT]') || (appointment.notes || '').toLowerCase().includes('ai generated');

    const handleStatusUpdate = async (newStatus: string) => {
        if (newStatus === 'completed') {
            setIsCompleteDialogOpen(true);
            return;
        }

        setLoading(true);
        try {
            if (appointment.status === 'pending' && newStatus === 'confirmed') {
                await appointmentsApi.confirm(appointment.id);
                toastWithSound.success('تم تأكيد طلب الحجز وإشعار المريض');
            } else if (appointment.status === 'pending' && newStatus === 'cancelled') {
                await appointmentsApi.reject(appointment.id, 'تم الرفض من الطبيب');
                toastWithSound.success('تم رفض طلب الحجز وإشعار المريض');
            } else {
                await appointmentsApi.update(appointment.id, { status: newStatus });
                toastWithSound.success('تم تحديث حالة الموعد');
            }
            if (onSuccess) onSuccess();
            onBack();
        } catch (error) {
            console.error('Error updating status:', error);
            toastWithSound.error('فشل تحديث الحالة');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProcedures = async () => {
        setSavingProcedures(true);
        try {
            await appointmentsApi.updateProcedures(appointment.id, proceduresData);
            setProceduresSaved(true);
            toastWithSound.success('تم حفظ الفحوصات والإجراءات بنجاح');
            if (onSuccess) onSuccess(); // to refresh data if needed
        } catch (error) {
            console.error('Error saving procedures:', error);
            toastWithSound.error('فشل حفظ الفحوصات والإجراءات');
        } finally {
            setSavingProcedures(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex gap-2">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-10 px-4 font-bold transition-all shadow-sm"
                    >
                        <ArrowRight className="h-4 w-4" />
                        <span className="hidden sm:inline">العودة للجدول</span>
                    </Button>
                    {onOpenChat && (
                        <Button
                            onClick={() => onOpenChat(appointment.phone)}
                            className="gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:text-blue-700 rounded-xl h-10 px-4 font-bold transition-all shadow-sm"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">محادثة المريض</span>
                        </Button>
                    )}
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-slate-500">موعد #{appointment.id}</p>
                    <p className="text-xs text-slate-400">{format(appointmentDate, 'EEEE، d MMMM - hh:mm a', { locale: ar })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
                {/* Right Column - Patient & Appointment Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-6 border border-orange-500 bg-white shadow-sm rounded-2xl">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{patientName}</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">معلومات المريض</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500">رقم الهاتف</p>
                                        <p className="text-sm font-black text-slate-900 font-mono" dir="ltr">
                                            {appointment.phone.split('@')[0]}
                                        </p>
                                    </div>
                                </div>

                                {appointment.contact?.nationalId && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <IdCard className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-500">الرقم الوطني</p>
                                            <p className="text-sm font-black text-slate-900 font-mono">
                                                {appointment.contact.nationalId}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {appointment.contact?.blood_type && (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Droplet className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-500">فصيلة الدم</p>
                                            <p className="text-sm font-black text-slate-900">
                                                {appointment.contact.blood_type}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Hash className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500">رقم الموعد</p>
                                        <p className="text-sm font-black text-slate-900">#{appointment.id}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Appointment Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-6 border border-orange-500 bg-white shadow-sm rounded-2xl">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">تفاصيل الموعد</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">معلومات الحجز</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-600">التاريخ والوقت</p>
                                            <p className="text-sm font-black text-blue-900">
                                                {format(appointmentDate, 'EEEE، d MMMM yyyy', { locale: ar })}
                                            </p>
                                            <p className="text-xs font-bold text-blue-700 mt-1">
                                                {format(appointmentDate, 'hh:mm a', { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-1">نوع الموعد</p>
                                        <p className="text-sm font-black text-slate-900">
                                            {typeConfig[appointmentType as keyof typeof typeConfig] || 'عام'}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 mb-1">المدة المتوقعة</p>
                                        <p className="text-sm font-black text-slate-900">{appointment.duration || 30} دقيقة</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    {isAutoBooked ? (
                                        <>
                                            <Bot className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="text-xs font-bold text-purple-600">مصدر الحجز</p>
                                                <p className="text-sm font-black text-purple-900">حجز آلي عبر الموظف الذكي</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <PenTool className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-600">مصدر الحجز</p>
                                                <p className="text-sm font-black text-gray-900">حجز يدوي</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {appointment.notes && (
                                    <div className="p-4 bg-orange-50 border-r-4 border-orange-400 rounded-l-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="h-4 w-4 text-orange-600" />
                                            <p className="text-xs font-bold text-orange-600">ملاحظات</p>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {appointment.notes.replace('[BOT]', '').replace('AI Generated Appointment', '').trim() || 'لا توجد ملاحظات'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Procedures & Initial Tests Card (For Confirmed Appointments) */}
                    {appointment.status === 'confirmed' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                        >
                            <Card className="p-6 border border-blue-500 bg-white shadow-sm rounded-2xl">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                        <TestTube className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">الفحوصات والإجراءات الأولية</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">مرحلة ما قبل التشخيص النهائي</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="font-bold flex items-center gap-2 text-slate-700">
                                            <Activity className="h-4 w-4 text-blue-500" />
                                            الفحوصات الأولية السريعة (اختياري)
                                        </Label>
                                        <Textarea
                                            placeholder="مثال: ضغط الدم 120/80، سكري 90، تخطيط قلب سليم..."
                                            className="min-h-[80px] rounded-xl bg-slate-50/50 border-slate-200 focus:border-blue-500"
                                            value={proceduresData.initialTests}
                                            onChange={(e) => setProceduresData(prev => ({ ...prev, initialTests: e.target.value }))}
                                            disabled={proceduresSaved}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold flex items-center gap-2 text-slate-700">
                                            <Syringe className="h-4 w-4 text-orange-500" />
                                            الإجراءات الطبية المتخذة (اختياري)
                                        </Label>
                                        <Textarea
                                            placeholder="مثال: تم إعطاء إبرة، غيار جرح، تبخيرة..."
                                            className="min-h-[80px] rounded-xl bg-slate-50/50 border-slate-200 focus:border-orange-500"
                                            value={proceduresData.medicalProcedures}
                                            onChange={(e) => setProceduresData(prev => ({ ...prev, medicalProcedures: e.target.value }))}
                                            disabled={proceduresSaved}
                                        />
                                    </div>

                                    {!proceduresSaved ? (
                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <Button 
                                                onClick={handleSaveProcedures} 
                                                disabled={savingProcedures || (!proceduresData.initialTests && !proceduresData.medicalProcedures)}
                                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                                            >
                                                {savingProcedures ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Save className="h-5 w-5 ml-2" />}
                                                حفظ الإجراءات والمتابعة
                                            </Button>
                                            <Button 
                                                onClick={() => setProceduresSaved(true)} 
                                                variant="outline"
                                                className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl"
                                            >
                                                <FastForward className="h-5 w-5 ml-2" />
                                                تخطي (لا توجد إجراءات)
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span className="font-bold text-sm">تم حفظ الإجراءات. يمكنك الآن إتمام الكشف.</span>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setProceduresSaved(false)}
                                                className="text-green-700 hover:bg-green-100"
                                            >
                                                تعديل
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Medical Record Card (if exists) */}
                    {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Card className="p-6 border border-orange-500 bg-white shadow-sm rounded-2xl">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                    <div className="h-12 w-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                                        <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">السجل الطبي</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">التشخيص والعلاج</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {appointment.medicalRecords[0].diagnosis && (
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity className="h-4 w-4 text-blue-600" />
                                                <p className="text-xs font-bold text-blue-600">التشخيص</p>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {appointment.medicalRecords[0].diagnosis}
                                            </p>
                                        </div>
                                    )}

                                    {appointment.medicalRecords[0].treatment && (
                                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Pill className="h-4 w-4 text-green-600" />
                                                <p className="text-xs font-bold text-green-600">العلاج</p>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {appointment.medicalRecords[0].treatment}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Left Column - Status & Actions */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-6 border border-orange-500 bg-white shadow-sm rounded-2xl sticky top-4">
                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">حالة الموعد</p>
                                <Badge
                                    className={`text-base font-black px-6 py-2 rounded-xl ${statusConfig[appointment.status as keyof typeof statusConfig]?.color}`}
                                >
                                    {statusConfig[appointment.status as keyof typeof statusConfig]?.label}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                {(appointment.status === 'scheduled' || appointment.status === 'pending') && (
                                    <>
                                        <Button
                                            onClick={() => handleStatusUpdate('confirmed')}
                                            disabled={loading}
                                            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
                                        >
                                            <CheckCircle2 className="h-5 w-5 ml-2" />
                                            تأكيد الموعد
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusUpdate('cancelled')}
                                            disabled={loading}
                                            variant="outline"
                                            className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all"
                                        >
                                            <XCircle className="h-5 w-5 ml-2" />
                                            إلغاء الموعد
                                        </Button>
                                    </>
                                )}

                                {appointment.status === 'confirmed' && (
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => handleStatusUpdate('completed')}
                                            disabled={loading || !proceduresSaved}
                                            className={`w-full h-12 font-bold rounded-xl transition-all ${
                                                proceduresSaved 
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20' 
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                            }`}
                                        >
                                            <CheckCircle2 className="h-5 w-5 ml-2" />
                                            {proceduresSaved ? 'إتمام الكشف (وصفة وتشخيص)' : 'أكمل الإجراءات أولاً'}
                                        </Button>
                                        {!proceduresSaved && (
                                            <p className="text-[10px] text-center text-slate-500 font-bold px-2 leading-relaxed">
                                                يرجى تعبئة بطاقة "الفحوصات والإجراءات" أو تخطيها لتفعيل هذا الزر.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {onOpenChat && (
                                    <Button
                                        onClick={() => onOpenChat(appointment.phone)}
                                        variant="outline"
                                        className="w-full h-12 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-all"
                                    >
                                        <MessageCircle className="h-5 w-5 ml-2" />
                                        فتح المحادثة
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Complete Appointment Dialog */}
            <CompleteAppointmentDialog
                isOpen={isCompleteDialogOpen}
                onClose={() => setIsCompleteDialogOpen(false)}
                appointment={appointment}
                onSuccess={() => {
                    if (onSuccess) onSuccess();
                    onBack();
                }}
            />
        </div>
    );
}
