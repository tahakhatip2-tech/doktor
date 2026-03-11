
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    FileDown,
    Send,
    CheckCircle2,
    AlertCircle,
    Stethoscope,
    Receipt,
    User,
    FileText,
    Pill,
    Save,
    X,
    Paperclip
} from 'lucide-react';
import { appointmentsApi, whatsappApi, BASE_URL } from '@/lib/api';
import { toastWithSound } from '@/lib/toast-with-sound';

interface CompleteAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    onSuccess: () => void;
}

export default function CompleteAppointmentDialog({ isOpen, onClose, appointment, onSuccess }: CompleteAppointmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [branding, setBranding] = useState({
        name: 'Doctor Jo',
        logo: '/logo.png'
    });
    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        fee_amount: '',
        fee_details: 'كشفية طبية',
        national_id: '',
        age: '',
        record_type: 'prescription'
    });
    const [file, setFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [sendingPdf, setSendingPdf] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const loadBranding = async () => {
            try {
                const settings = await whatsappApi.getSettings();
                if (settings.clinic_name || settings.clinic_logo) {
                    const logoUrl = settings.clinic_logo
                        ? (settings.clinic_logo.startsWith('http') ? settings.clinic_logo : `${BASE_URL}${settings.clinic_logo}`)
                        : '/logo.png';
                    setBranding({
                        name: settings.clinic_name || 'عيادتي',
                        logo: logoUrl
                    });
                }
            } catch (error) {
                console.error('Error loading branding:', error);
            }
        };

        if (isOpen) {
            loadBranding();
            setIsSaved(false);
            setPdfUrl(null);
            setFile(null);
            if (appointment) {
                setFormData({
                    diagnosis: '',
                    treatment: '',
                    fee_amount: '',
                    fee_details: 'كشفية طبية',
                    national_id: appointment.contact?.nationalId || '',
                    age: appointment.contact?.ageRange || '',
                    record_type: 'prescription'
                });
            }
        }
    }, [isOpen, appointment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment) return;

        setLoading(true);
        try {
            const data: any = {
                // لا نرسل patientId — الباك اند سيجلبه من الموعد مباشرة
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                feeAmount: parseFloat(formData.fee_amount) || 0,
                feeDetails: formData.fee_details,
                nationalId: formData.national_id,
                age: formData.age,
                recordType: formData.record_type
            };

            let payload = data;

            if (file) {
                payload = new FormData();
                Object.keys(data).forEach(key => payload.append(key, data[key]));
                payload.append('file', file);
            }

            await appointmentsApi.saveMedicalRecord(appointment.id, payload);
            setIsSaved(true);
            toastWithSound.success('تم أرشفة الزيارة بنجاح. يمكنك الآن تصدير الوصفة.');
        } catch (error: any) {
            console.error('Failed to save medical record:', error);
            toastWithSound.error('فشل في حفظ البيانات: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePdf = async () => {
        if (!appointment) return;
        setGeneratingPdf(true);
        try {
            const result = await appointmentsApi.generatePrescription(appointment.id);
            setPdfUrl(result.url);
            toastWithSound.success('تم إنشاء الوصفة الطبية بنجاح');
            window.open(result.url, '_blank');
        } catch (error: any) {
            console.error('PDF Generation failed:', error);
            toastWithSound.error('فشل في إنشاء ملف PDF');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!appointment || !pdfUrl) return;
        setSendingPdf(true);
        try {
            await appointmentsApi.sendPrescription(appointment.id, {
                url: pdfUrl,
                phone: appointment.phone
            });
            toastWithSound.success('تم إرسال الوصفة عبر الواتساب بنجاح');
        } catch (error: any) {
            console.error('WhatsApp sending failed:', error);
            toastWithSound.error('فشل في إرسال الوصفة عبر الواتساب');
        } finally {
            setSendingPdf(false);
        }
    };

    if (!appointment) return null;

    const recordTypes = [
        { id: 'prescription', label: 'وصفة طبية', icon: Pill },
        { id: 'lab_report', label: 'تقرير مختبر', icon: Stethoscope },
        { id: 'sick_leave', label: 'إجازة مرضية', icon: FileText },
        { id: 'referral', label: 'تحويل طبي', icon: User }
    ];

    const diagnosisLabel =
        formData.record_type === 'lab_report' ? 'الفحوصات المطلوبة / التشخيص' :
            formData.record_type === 'sick_leave' ? 'السبب الطبي للإجازة' :
                formData.record_type === 'referral' ? 'سبب التحويل' :
                    'التشخيص الطبي';

    const treatmentLabel =
        formData.record_type === 'lab_report' ? 'النتائج / ملاحظات المختبر' :
            formData.record_type === 'sick_leave' ? 'مدة الإجازة والتوصيات' :
                formData.record_type === 'referral' ? 'الجهة المحول إليها' :
                    'العلاج المقترح (الأدوية)';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-4xl p-0 max-h-[90vh] overflow-y-auto border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl"
                dir="rtl"
            >
                <DialogHeader className="p-8 bg-gradient-to-r from-primary/10 via-background to-background border-b border-border/50">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <div className="p-1.5 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-border/50">
                                <img
                                    src={branding.logo}
                                    alt="Logo"
                                    className="h-12 w-12 rounded-xl object-cover shadow-glow"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                                />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tight">{branding.name}</DialogTitle>
                                <p className="text-muted-foreground text-sm font-medium">إتمام الزيارة والتوثيق الطبي</p>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end opacity-50">
                            <Stethoscope className="h-8 w-8 text-primary/50" />
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Medical Record</span>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Medical Section */}
                        <div className="space-y-6 animate-slide-in-right">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                <FileText className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-lg">التوثيق الطبي (الوصفة)</h3>
                            </div>

                            <div className="space-y-4">
                                {/* Patient Info */}
                                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-2">
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <User className="h-4 w-4" />
                                        <span>بيانات المريض الحالي:</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-black pr-6">
                                                {appointment.customerName 
                                                    || appointment.patient_name 
                                                    || appointment.customer_name 
                                                    || appointment.patient?.fullName 
                                                    || 'مريض'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground pr-6 uppercase tracking-widest font-bold">
                                                رقم الموعد: #{appointment.id}
                                                {appointment.notes?.includes('[BOT-INTERNAL]') && (
                                                    <span className="mr-2 text-amber-600">• حجز موظف آلي</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold pr-1 text-muted-foreground">الرقم الوطني:</Label>
                                            <Input
                                                placeholder="أدخل الرقم الوطني..."
                                                className="h-9 text-sm bg-white/50"
                                                value={formData.national_id}
                                                onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold pr-1 text-muted-foreground">العمر:</Label>
                                            <Input
                                                placeholder="مثال: 25 سنة"
                                                className="h-9 text-sm bg-white/50"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Record Type */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                                    {recordTypes.map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, record_type: type.id })}
                                            className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${formData.record_type === type.id
                                                    ? 'bg-primary text-white border-primary shadow-md scale-105'
                                                    : 'bg-white text-muted-foreground border-border/50 hover:bg-gray-50'
                                                }`}
                                        >
                                            <type.icon className="h-4 w-4" />
                                            <span className="text-[10px] font-bold">{type.label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Diagnosis */}
                                <div className="space-y-2">
                                    <Label className="font-bold pr-1">{diagnosisLabel}</Label>
                                    <Textarea
                                        placeholder={formData.record_type === 'lab_report' ? 'اذكر الفحوصات المطلوبة...' : 'اكتب التفاصيل هنا...'}
                                        className="min-h-[100px] rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all text-sm leading-relaxed"
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    />
                                </div>

                                {/* Treatment */}
                                <div className="space-y-2">
                                    <Label className="font-bold pr-1 flex items-center gap-2 text-amber-600">
                                        {formData.record_type === 'lab_report' ? <Stethoscope className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                                        {treatmentLabel}
                                    </Label>
                                    <Textarea
                                        placeholder="اكتب التفاصيل هنا..."
                                        className="min-h-[120px] rounded-2xl bg-muted/20 border-border/50 focus:border-amber-500/50 transition-all text-sm leading-relaxed"
                                        value={formData.treatment}
                                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    />
                                </div>

                                {/* File Attachment */}
                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <Label className="font-bold pr-1 flex items-center gap-2 text-blue-600">
                                        <Paperclip className="h-4 w-4" />
                                        مرفقات (صورة أو PDF) - اختياري
                                    </Label>
                                    <Input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="cursor-pointer file:cursor-pointer file:border-0 file:bg-blue-50 file:text-blue-700 file:rounded-xl file:px-4 file:mr-4 hover:file:bg-blue-100"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Financial Section */}
                        <div className="space-y-6 animate-slide-in-left">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                <Receipt className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-lg">المحاسبة والفاتورة</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="font-bold pr-1 text-primary">قيمة الكشفية / الخدمة</Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                className="h-14 rounded-2xl pl-16 text-left font-display font-black text-xl bg-background border-primary/20 focus:border-primary/50 ring-offset-0 transition-all group-hover:bg-primary/5"
                                                value={formData.fee_amount}
                                                onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary/50 group-focus-within:text-primary transition-colors">
                                                دينار
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-bold pr-1 text-primary">توصيف الدفعة</Label>
                                        <Input
                                            placeholder="مثال: كشفية عامة، فحص أشعة..."
                                            className="h-12 rounded-xl bg-background border-primary/20 focus:border-primary/50 transition-all"
                                            value={formData.fee_details}
                                            onChange={(e) => setFormData({ ...formData, fee_details: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-2xl text-[11px] text-blue-800 font-medium leading-relaxed">
                                    <span className="font-bold">ملاحظة:</span> تم أرشفة البيانات طبياً. يمكنك الآن تصدير الوصفة الطبية (PDF) <span className="text-primary font-bold">اختياريًا</span> أو إغلاق النافذة.
                                </div>

                                {isSaved && (
                                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <Button
                                            type="button"
                                            onClick={handleGeneratePdf}
                                            disabled={generatingPdf}
                                            className="h-14 rounded-2xl bg-slate-900 border-none hover:bg-slate-800 text-white shadow-lg flex items-center justify-between px-6"
                                        >
                                            <div className="flex items-center gap-3">
                                                {generatingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
                                                <span className="font-bold">توليد الوصفة الطبية (PDF) - اختياري</span>
                                            </div>
                                            {pdfUrl && <CheckCircle2 className="h-5 w-5 text-primary" />}
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={handleSendWhatsApp}
                                            disabled={sendingPdf || !pdfUrl}
                                            className={`h-14 rounded-2xl border-none shadow-lg flex items-center justify-between px-6 transition-all ${!pdfUrl
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-primary hover:bg-primary/90 text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {sendingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                                <span className="font-bold">إرسال عبر واتساب المريض</span>
                                            </div>
                                            {!pdfUrl && <AlertCircle className="h-5 w-5 opacity-50" />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-8 border-t border-border/50 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-12 px-8 rounded-xl font-bold hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                            <X className="h-4 w-4 ml-2" />
                            تجاهل التوثيق
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 px-8 rounded-xl font-black shadow-glow transition-all active:scale-95 bg-primary hover:bg-primary/90 text-white"
                            disabled={loading || isSaved}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : isSaved ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 ml-2" />
                                    تم التوثيق بنجاح
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 ml-2" />
                                    حفظ التوثيق وإكمال الحجز
                                </>
                            )}
                        </Button>
                        {isSaved && (
                            <Button
                                type="button"
                                onClick={() => { onSuccess(); onClose(); }}
                                className="h-12 px-8 rounded-xl font-black bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                إغلاق ونافذة المواعيد
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
