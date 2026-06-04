
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
    Paperclip,
    Plus,
    Trash2
} from 'lucide-react';
import { appointmentsApi, whatsappApi, BASE_URL } from '@/lib/api';
import { toastWithSound } from '@/lib/toast-with-sound';
import axios from 'axios';
import { useActiveDoctor } from '@/context/ActiveDoctorContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ClinicDoctor {
    id: number;
    name: string;
    specialty?: string;
    isActive: boolean;
}

interface Medication {
    name: string;
    type: string;
    frequency: string;
    duration: string;
}

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
        record_type: 'prescription',
        sickLeaveDays: '',
        sickLeaveReason: '',
        referralTo: '',
        referralReason: '',
        treating_doctor_id: '' as string | number,
    });
    const [showSickLeave, setShowSickLeave] = useState(false);
    const [showReferral, setShowReferral] = useState(false);
    const [clinicDoctors, setClinicDoctors] = useState<ClinicDoctor[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [medications, setMedications] = useState<Medication[]>([{ name: '', type: 'حبوب', frequency: '', duration: '' }]);
    const { activeDoctor } = useActiveDoctor();

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
            setFile(null);
            // جلب أطباء العيادة داخل دالة async منفصلة
            const loadDoctors = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/clinic-doctors`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setClinicDoctors((res.data || []).filter((d: ClinicDoctor) => d.isActive));
                } catch { /* تجاهل الخطأ */ }
            };
            loadDoctors();

            if (appointment) {
                setFormData({
                    diagnosis: '',
                    treatment: '',
                    fee_amount: '',
                    fee_details: 'كشفية طبية',
                    national_id: appointment.contact?.nationalId || '',
                    age: appointment.contact?.ageRange || '',
                    record_type: 'prescription',
                    sickLeaveDays: '',
                    sickLeaveReason: '',
                    referralTo: '',
                    referralReason: '',
                    treating_doctor_id: activeDoctor ? activeDoctor.id.toString() : '',
                });
                setShowSickLeave(false);
                setShowReferral(false);
                setMedications([{ name: '', type: 'حبوب', frequency: '', duration: '' }]);
            }
        }
    }, [isOpen, appointment, activeDoctor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment) return;

        setLoading(true);
        try {
            const data: any = {
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                feeAmount: parseFloat(formData.fee_amount) || 0,
                feeDetails: formData.fee_details,
                nationalId: formData.national_id,
                age: formData.age,
                recordType: 'prescription', // Always baseline
                sickLeaveDays: showSickLeave ? formData.sickLeaveDays : undefined,
                sickLeaveReason: showSickLeave ? formData.sickLeaveReason : undefined,
                referralTo: showReferral ? formData.referralTo : undefined,
                referralReason: showReferral ? formData.referralReason : undefined,
                medications: medications.filter(m => m.name.trim() !== ''),
                ...(formData.treating_doctor_id ? { treatingDoctorId: Number(formData.treating_doctor_id) } : {}),
            };

            let payload = data;

            if (file) {
                payload = new FormData();
                Object.keys(data).forEach(key => {
                    if (key === 'medications') {
                        payload.append(key, JSON.stringify(data[key]));
                    } else {
                        payload.append(key, data[key]);
                    }
                });
                payload.append('file', file);
            }

            await appointmentsApi.saveMedicalRecord(appointment.id, payload);
            toastWithSound.success('تم أرشفة الزيارة بنجاح ورفع السجل.');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to save medical record:', error);
            toastWithSound.error('فشل في حفظ البيانات: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!appointment) return null;

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

                                {/* Prescription Details */}
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold pr-1">التشخيص الطبي</Label>
                                        <Textarea
                                            placeholder="اكتب التشخيص هنا..."
                                            className="min-h-[100px] rounded-2xl bg-muted/20 border-border/50 focus:border-primary/50 transition-all text-sm leading-relaxed"
                                            value={formData.diagnosis}
                                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold pr-1 flex items-center gap-2 text-amber-600">
                                                <Pill className="h-4 w-4" />
                                                العلاج والأدوية الموصوفة
                                            </Label>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                className="h-8 rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50"
                                                onClick={() => setMedications([...medications, { name: '', type: 'حبوب', frequency: '', duration: '' }])}
                                            >
                                                <Plus className="h-4 w-4 ml-1" /> إضافة دواء
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {medications.map((med, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start p-3 bg-muted/20 border border-border/50 rounded-xl relative group">
                                                    <div className="flex-1 space-y-1 w-full">
                                                        <Label className="text-[10px] text-muted-foreground font-bold">اسم الدواء</Label>
                                                        <Input 
                                                            placeholder="مثال: Panadol" 
                                                            className="h-9 bg-white/50 text-sm"
                                                            value={med.name}
                                                            onChange={(e) => {
                                                                const newMeds = [...medications];
                                                                newMeds[index].name = e.target.value;
                                                                setMedications(newMeds);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-full sm:w-[120px] space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground font-bold">النوع</Label>
                                                        <select
                                                            className="w-full h-9 rounded-md border border-input bg-white/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            value={med.type}
                                                            onChange={(e) => {
                                                                const newMeds = [...medications];
                                                                newMeds[index].type = e.target.value;
                                                                setMedications(newMeds);
                                                            }}
                                                        >
                                                            <option value="حبوب">حبوب</option>
                                                            <option value="شرب">شرب</option>
                                                            <option value="كبسول">كبسول</option>
                                                            <option value="مرهم/كريم">مرهم/كريم</option>
                                                            <option value="حقنة">حقنة</option>
                                                            <option value="قطرة">قطرة</option>
                                                            <option value="بخاخ">بخاخ</option>
                                                            <option value="أخرى">أخرى</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1 space-y-1 w-full">
                                                        <Label className="text-[10px] text-muted-foreground font-bold">الجرعة والتكرار</Label>
                                                        <Input 
                                                            placeholder="مثال: حبة كل 12 ساعة" 
                                                            className="h-9 bg-white/50 text-sm"
                                                            value={med.frequency}
                                                            onChange={(e) => {
                                                                const newMeds = [...medications];
                                                                newMeds[index].frequency = e.target.value;
                                                                setMedications(newMeds);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-full sm:w-[100px] space-y-1">
                                                        <Label className="text-[10px] text-muted-foreground font-bold">المدة</Label>
                                                        <Input 
                                                            placeholder="مثال: 5 أيام" 
                                                            className="h-9 bg-white/50 text-sm"
                                                            value={med.duration}
                                                            onChange={(e) => {
                                                                const newMeds = [...medications];
                                                                newMeds[index].duration = e.target.value;
                                                                setMedications(newMeds);
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 mt-5 sm:mt-5 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            const newMeds = medications.filter((_, i) => i !== index);
                                                            setMedications(newMeds.length ? newMeds : [{ name: '', type: 'حبوب', frequency: '', duration: '' }]);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                            <Label className="font-bold pr-1 text-muted-foreground text-xs">تعليمات وملاحظات عامة (اختياري)</Label>
                                            <Textarea
                                                placeholder="اكتب أي تعليمات عامة للمريض هنا..."
                                                className="min-h-[60px] rounded-2xl bg-muted/20 border-border/50 focus:border-amber-500/50 transition-all text-sm leading-relaxed"
                                                value={formData.treatment}
                                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Additions (Sick Leave & Referral) */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <Label className="font-bold text-muted-foreground flex items-center gap-2 mb-2">إضافات اختيارية (الإجازة والتحويل):</Label>
                                    
                                    {/* Sick Leave Toggle */}
                                    <div className={`p-4 rounded-2xl border transition-all ${showSickLeave ? 'border-primary/50 bg-primary/5' : 'border-border/50 hover:bg-muted/30'}`}>
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={showSickLeave}
                                                onChange={(e) => setShowSickLeave(e.target.checked)}
                                            />
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <FileText className="h-4 w-4 text-primary" />
                                                إضافة إجازة مرضية
                                            </div>
                                        </label>
                                        
                                        {showSickLeave && (
                                            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground">مدة الإجازة (أيام)</Label>
                                                    <Input
                                                        placeholder="مثال: 3"
                                                        type="number"
                                                        className="bg-white/50"
                                                        value={formData.sickLeaveDays}
                                                        onChange={(e) => setFormData({ ...formData, sickLeaveDays: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground">السبب الطبي للإجازة</Label>
                                                    <Textarea
                                                        placeholder="اذكر السبب..."
                                                        className="bg-white/50 min-h-[60px]"
                                                        value={formData.sickLeaveReason}
                                                        onChange={(e) => setFormData({ ...formData, sickLeaveReason: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Referral Toggle */}
                                    <div className={`p-4 rounded-2xl border transition-all ${showReferral ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50 hover:bg-muted/30'}`}>
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                checked={showReferral}
                                                onChange={(e) => setShowReferral(e.target.checked)}
                                            />
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <User className="h-4 w-4 text-amber-600" />
                                                إضافة تحويل طبي
                                            </div>
                                        </label>

                                        {showReferral && (
                                            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground">الجهة المحول إليها (طبيب أو مستشفى)</Label>
                                                    <Input
                                                        placeholder="مثال: د. أحمد (باطنية)"
                                                        className="bg-white/50"
                                                        value={formData.referralTo}
                                                        onChange={(e) => setFormData({ ...formData, referralTo: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-muted-foreground">سبب التحويل</Label>
                                                    <Textarea
                                                        placeholder="اذكر سبب التحويل أو الحالة..."
                                                        className="bg-white/50 min-h-[60px]"
                                                        value={formData.referralReason}
                                                        onChange={(e) => setFormData({ ...formData, referralReason: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
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

                                    {/* Treating Doctor */}
                                    {clinicDoctors.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="font-bold pr-1 text-primary flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4" />
                                                الطبيب المعالج
                                            </Label>
                                            <select
                                                value={formData.treating_doctor_id}
                                                onChange={(e) => setFormData({ ...formData, treating_doctor_id: e.target.value })}
                                                disabled={!!activeDoctor}
                                                className={`w-full h-12 rounded-xl border border-primary/20 bg-background px-3 text-sm font-bold text-right focus:outline-none focus:border-primary/50 transition-all ${!!activeDoctor ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">— اختر الطبيب المعالج (اختياري) —</option>
                                                {clinicDoctors.map(doc => (
                                                    <option key={doc.id} value={doc.id}>
                                                        {doc.name}{doc.specialty ? ` — ${doc.specialty}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {activeDoctor && (
                                                <p className="text-[10px] text-blue-600 mt-1">
                                                    تم اختيار الطبيب تلقائياً بناءً على تسجيل الدخول الحالي.
                                                </p>
                                            )}
                                        </div>
                                    )}

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
                                    <span className="font-bold">ملاحظة:</span> سيتم أرشفة البيانات طبياً بالكامل لتبقى في سجل المريض.
                                </div>
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
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-5 w-5 ml-2" />
                                    حفظ التوثيق وإكمال الحجز
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
