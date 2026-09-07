import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Stethoscope, Calendar, Search, Download,
    ChevronDown, ChevronUp, ClipboardList, FlaskConical,
    Bed, ArrowRightLeft, Loader2, AlertCircle, FileX, Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import TemplateViewer from '@/components/medical-templates/TemplateViewer';
import PatientHero from '@/components/patient/PatientHero';

import { buildPrescriptionHTML } from '@/utils/print/prescriptionTemplate';
import { buildSickLeaveHTML } from '@/utils/print/sickLeaveTemplate';
import { buildReferralHTML } from '@/utils/print/referralTemplate';
import { printHtmlString } from '@/utils/print/webPrintHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const recordTypeMap: Record<string, { label: string; icon: any; color: string; bgClass: string }> = {
    prescription: { label: 'وصفة طبية', icon: ClipboardList, color: 'bg-blue-100 text-blue-700', bgClass: 'bg-gradient-to-l from-blue-600 from-50% to-blue-500 to-50%' },
    lab_result: { label: 'نتائج الفحوصات', icon: FlaskConical, color: 'bg-purple-100 text-purple-700', bgClass: 'bg-gradient-to-l from-purple-600 from-50% to-purple-500 to-50%' },
    sick_leave: { label: 'إجازة مرضية', icon: Bed, color: 'bg-yellow-100 text-yellow-700', bgClass: 'bg-gradient-to-l from-orange-500 from-50% to-orange-400 to-50%' },
    referral: { label: 'تحويل طبي', icon: ArrowRightLeft, color: 'bg-green-100 text-green-700', bgClass: 'bg-gradient-to-l from-emerald-500 from-50% to-emerald-400 to-50%' },
};

const statusMap: Record<string, { label: string; color: string }> = {
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
    pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
    cancelled: { label: 'ملغى', color: 'bg-red-100 text-red-700' },
};

interface MedicalRecord {
    id: number;
    appointmentId: number;
    diagnosis: string | null;
    treatment: string | null;
    feeAmount: number | null;
    recordType: string;
    pdfUrl: string | null;
    aiAdvice?: string | null;
    sickLeaveDays?: string | null;
    sickLeaveReason?: string | null;
    referralTo?: string | null;
    referralReason?: string | null;
    appointment: {
        appointmentDate: string;
        customerName: string;
        status: string;
        user?: { name: string; clinic_name: string; clinic_specialty: string; avatar?: string; clinic_logo?: string };
        prescriptions?: Array<{
            id: number;
            status: string;
        }>;
    };
    medications?: Array<{
        name: string;
        type: string;
        frequency: string;
        duration: string;
    }>;
    templateData?: Record<string, any>;
    treatingDoctor?: { specialty?: string };
}

export default function PatientMedicalRecords() {
    const { token } = usePatientAuth(true);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    // AI advice state: { [recordId]: { loading, advice } }
    const [adviceState, setAdviceState] = useState<Record<number, { loading: boolean; advice: string | null }>>({});

    useEffect(() => {
        if (token) fetchRecords();
    }, [token]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/patient/appointments/medical-records/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedRecords = Array.isArray(res.data)
                ? res.data
                : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
            setRecords(fetchedRecords);
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ في جلب السجلات الطبية');
        } finally {
            setLoading(false);
        }
    };

    const fetchAiAdvice = async (record: MedicalRecord) => {
        // If advice already embedded in record, show it directly
        if (record.aiAdvice) {
            setAdviceState(prev => ({ ...prev, [record.id]: { loading: false, advice: record.aiAdvice! } }));
            return;
        }
        setAdviceState(prev => ({ ...prev, [record.id]: { loading: true, advice: null } }));
        try {
            const res = await axios.get(`${API_URL}/patient/appointments/medical-records/${record.id}/advice`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const advice = res.data?.advice || 'لا تتوفر نصائح حالياً';
            setAdviceState(prev => ({ ...prev, [record.id]: { loading: false, advice } }));
            // Also update the local record so we don't re-fetch
            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, aiAdvice: advice } : r));
        } catch {
            setAdviceState(prev => ({ ...prev, [record.id]: { loading: false, advice: 'تعذر جلب النصائح' } }));
        }
    };
    const handleDownloadPdf = async (e: React.MouseEvent, recordUrl: string) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('patient_token');
            const fileUrl = `${API_URL.replace('/api', '')}${recordUrl}`;
            
            // Download as blob to bypass ngrok warning
            const fileResponse = await axios.get(fileUrl, {
                responseType: 'blob',
                headers: { 
                    'ngrok-skip-browser-warning': 'true',
                    Authorization: `Bearer ${token}` 
                }
            });

            const blobUrl = window.URL.createObjectURL(new Blob([fileResponse.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `document_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Failed to download PDF', err);
        }
    };
    const filtered = records.filter((r) => {
        const q = search.toLowerCase();
        return (
            r.appointment?.user?.clinic_name?.toLowerCase().includes(q) ||
            r.appointment?.user?.clinic_specialty?.toLowerCase().includes(q) ||
            r.diagnosis?.toLowerCase().includes(q) ||
            recordTypeMap[r.recordType]?.label.includes(q)
        );
    });

    const handlePrint = (record: MedicalRecord, type: 'prescription' | 'sickLeave' | 'referral') => {
        const appt = record.appointment;
        const user = appt?.user;
        const clinicName = user?.clinic_name || 'عيادة طبية';
        const clinicSpecialty = user?.clinic_specialty || '';
        const clinicPhone = '';
        const clinicAddress = '';
        
        let clinicLogoUrl = null;
        const rawLogo = user?.clinic_logo || user?.avatar;
        if (rawLogo) {
            clinicLogoUrl = rawLogo.startsWith('http') ? rawLogo : `${API_URL.replace('/api', '')}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`;
        }
        
        const doctorName = user?.name || '';
        const patientName = appt?.customerName || 'المريض';
        const visitDateRaw = appt?.appointmentDate || new Date().toISOString();
        const visitDate = appt?.appointmentDate
            ? format(new Date(appt.appointmentDate), 'dd/MM/yyyy')
            : '—';
            
        const baseData = {
            recordId: record.id,
            patientName,
            clinicName,
            clinicSpecialty,
            clinicPhone,
            clinicAddress,
            clinicLogoUrl,
            doctorName,
            visitDate,
        };

        let html = '';
        if (type === 'prescription') {
            const medsString = record.medications 
                ? record.medications.map(m => `${m.name} - ${m.type} (${m.frequency} | ${m.duration})`).join('\\n') 
                : record.treatment || '';
            
            html = buildPrescriptionHTML({
                ...baseData,
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || '',
                medications: medsString,
            });
        } else if (type === 'sickLeave') {
            html = buildSickLeaveHTML({
                ...baseData,
                sickLeaveDays: parseInt(record.sickLeaveDays || '0'),
                sickLeaveReason: record.sickLeaveReason || '',
                diagnosis: record.diagnosis || '',
            });
        } else if (type === 'referral') {
            html = buildReferralHTML({
                ...baseData,
                referralTo: record.referralTo || '',
                referralReason: record.referralReason || '',
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || '',
            });
        }

        printHtmlString(html, 'طباعة');
    };

    const handleShareWhatsApp = (record: MedicalRecord, type: 'sickLeave') => {
        if (type === 'sickLeave') {
            const patientName = record.appointment?.customerName || 'المريض';
            const text = `*إجازة مرضية*\nالمريض: ${patientName}\nالتشخيص: ${record.diagnosis || 'غير محدد'}\nأيام الإجازة: ${record.sickLeaveDays} أيام\n\nمع تمنياتنا بالشفاء العاجل.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={fetchRecords} variant="outline">إعادة المحاولة</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Hero Section */}
            <PatientHero
                showBackButton={true}
                title="السجلات الطبية"
                subtitle="ملفك الصحي الشامل"
                description="جميع تقاريرك ووصفاتك الطبية في مكان واحد آمن وسهل الوصول."
                badgeText={`${records.length} سجل طبي`}
            />

            <div className="px-4 sm:px-0 space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث بالعيادة، التشخيص، أو نوع السجل..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9"
                        dir="rtl"
                    />
                </div>

                {/* Summary Cards - Capsule Style */}
                <motion.div 
                    initial="hidden" animate="visible" 
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto mb-2"
                >
                    {Object.entries(recordTypeMap).map(([key, val]) => {
                        const Icon = val.icon;
                        const count = records.filter(r => r.recordType === key).length;
                        return (
                            <motion.div key={key} variants={{ hidden: { y: 20, opacity: 0, scale: 0.8 }, visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 250, damping: 20 } } }}>
                                <div
                                    className={`relative rounded-full border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group ${val.bgClass} text-white`}
                                >
                                    {/* Capsule Middle Shine Divider */}
                                    <div className="absolute top-0 right-1/2 w-1.5 h-full bg-white/20 backdrop-blur-sm z-0 transform translate-x-1/2" />
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                    
                                    <div className="py-2.5 sm:py-4 px-4 sm:px-6 relative z-10 flex items-center justify-between">
                                        <div className="flex-1 text-right ml-2">
                                            <p className="text-[10px] sm:text-xs font-bold text-white/90 mb-0.5 line-clamp-1">{val.label}</p>
                                            <p className="text-sm sm:text-xl font-black text-white whitespace-nowrap">
                                                {count}
                                            </p>
                                        </div>
                                        <div className="p-2 sm:p-2.5 rounded-full bg-white/20 backdrop-blur-md shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Records List */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
                        <FileX className="h-16 w-16 text-muted-foreground/30" />
                        <div>
                            <p className="font-medium text-muted-foreground">لا توجد سجلات طبية</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">
                                {search ? 'لا توجد نتائج لبحثك' : 'ستظهر سجلاتك الطبية هنا بعد اكتمال مواعيدك'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial="hidden" animate="visible" 
                        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
                        className="space-y-3"
                    >
                        {filtered.map((record) => {
                            const typeInfo = recordTypeMap[record.recordType] || recordTypeMap['prescription'];
                            const statusInfo = statusMap[record.appointment?.status] || { label: record.appointment?.status, color: 'bg-gray-100 text-gray-700' };
                            const Icon = typeInfo.icon;
                            const isExpanded = expandedId === record.id;
                            const date = record.appointment?.appointmentDate
                                ? format(new Date(record.appointment.appointmentDate), 'dd MMMM yyyy', { locale: ar })
                                : '—';
                            const advice = adviceState[record.id];

                            return (
                                <motion.div key={record.id} variants={{ hidden: { y: 20, opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } } }}>
                                    <Card className="relative rounded-2xl border border-blue-100 hover:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                                    <button className="w-full text-right" onClick={() => setExpandedId(isExpanded ? null : record.id)}>
                                        <div className="flex items-start justify-between p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-xl blur-[4px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative h-12 w-12 rounded-xl bg-white p-0.5 z-10 flex items-center justify-center overflow-hidden">
                                                        {(record.appointment?.user?.clinic_logo || record.appointment?.user?.avatar) ? (
                                                            <img 
                                                                src={(record.appointment.user.clinic_logo || record.appointment.user.avatar)?.startsWith('http') ? (record.appointment.user.clinic_logo || record.appointment.user.avatar) : `${API_URL.replace('/api', '')}${(record.appointment.user.clinic_logo || record.appointment.user.avatar)?.startsWith('/') ? '' : '/'}${record.appointment.user.clinic_logo || record.appointment.user.avatar}`} 
                                                                alt={record.appointment?.user?.clinic_name || 'العيادة'} 
                                                                className="w-full h-full object-cover rounded-[10px]"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`h-full w-full rounded-[10px] flex items-center justify-center border border-white ${typeInfo.color} ${(record.appointment?.user?.clinic_logo || record.appointment?.user?.avatar) ? 'hidden' : ''}`}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${typeInfo.color}`}>{typeInfo.label}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${statusInfo.color}`}>{statusInfo.label}</span>
                                                    </div>
                                                    <h4 className="font-extrabold text-base text-blue-950 truncate">
                                                        {record.appointment?.user?.clinic_name || 'عيادة طبية'}
                                                    </h4>
                                                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                                        د. {record.appointment?.user?.name || 'طبيب غير محدد'}
                                                    </p>
                                                    
                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                        <p className="text-xs text-orange-600 font-bold flex items-center gap-1.5 truncate bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100">
                                                            <Stethoscope className="h-3 w-3" />
                                                            <span>{record.appointment?.user?.clinic_specialty || 'سجل طبي'}</span>
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-blue-400" />
                                                            {date}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col items-center h-full py-1 gap-4">
                                                {record.feeAmount && (
                                                    <span className="text-sm font-black text-blue-600">
                                                        {Number(record.feeAmount).toFixed(2)} د.أ
                                                    </span>
                                                )}
                                                <div className="text-slate-400 transition-transform duration-300">
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <CardContent className="pt-0 border-t space-y-4">
                                            {/* Print Buttons Bar */}
                                            <div className="flex flex-wrap gap-2 pt-4 mb-2">
                                                {(record.medications?.length > 0 || record.treatment) && (
                                                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100" onClick={() => handlePrint(record, 'prescription')}>
                                                        <ClipboardList className="w-4 h-4 ml-2" /> طباعة الوصفة
                                                    </Button>
                                                )}
                                                {record.sickLeaveDays && (
                                                    <>
                                                        <Button variant="outline" size="sm" className="border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100" onClick={() => handlePrint(record, 'sickLeave')}>
                                                            <Bed className="w-4 h-4 ml-2" /> طباعة الإجازة
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="border-[#25D366] text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20" onClick={() => handleShareWhatsApp(record, 'sickLeave')}>
                                                            <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                                            </svg>
                                                            مشاركة الواتساب
                                                        </Button>
                                                    </>
                                                )}
                                                {record.referralTo && (
                                                    <Button variant="outline" size="sm" className="border-green-200 text-green-700 bg-green-50 hover:bg-green-100" onClick={() => handlePrint(record, 'referral')}>
                                                        <ArrowRightLeft className="w-4 h-4 ml-2" /> طباعة التحويلة
                                                    </Button>
                                                )}
                                            </div>

                                            {record.diagnosis && (
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">التشخيص</p>
                                                    <p className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed">{record.diagnosis}</p>
                                                </div>
                                            )}
                                            {record.medications && record.medications.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">الأدوية الموصوفة</p>
                                                    <div className="grid gap-2">
                                                        {record.medications.map((med, idx) => (
                                                            <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-sm flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                                <div>
                                                                    <span className="font-black text-amber-900">{med.name}</span>
                                                                    <span className="text-amber-700/80 text-xs mr-2 px-2 py-0.5 bg-amber-100 rounded-full">{med.type}</span>
                                                                </div>
                                                                <div className="text-amber-800 text-xs font-medium flex gap-3">
                                                                    <span>{med.frequency}</span>
                                                                    <span className="text-amber-600/70">|</span>
                                                                    <span>{med.duration}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* QR Code Section for Pharmacy */}
                                                    {record.appointment?.prescriptions && record.appointment.prescriptions.length > 0 && (
                                                        <div className="mt-6 flex flex-col items-center p-4 bg-white border-2 border-dashed border-blue-200 rounded-2xl">
                                                            <p className="text-sm font-bold text-blue-800 mb-2">رمز صرف الوصفة للصيدلية</p>
                                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                                                <QRCodeSVG 
                                                                    value={record.appointment.prescriptions[0].id.toString()} 
                                                                    size={150}
                                                                    level="H"
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 font-medium mt-3 text-center">
                                                                أظهر هذا الرمز للصيدلاني ليتمكن من صرف الوصفة فوراً
                                                            </p>
                                                            <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold ${
                                                                record.appointment.prescriptions[0].status === 'DISPENSED' 
                                                                    ? 'bg-green-100 text-green-700' 
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {record.appointment.prescriptions[0].status === 'DISPENSED' ? 'تم الصرف' : 'بانتظار الصرف'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {record.treatment && (
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">تعليمات إضافية</p>
                                                    <p className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{record.treatment}</p>
                                                </div>
                                            )}
                                            {record.sickLeaveDays && (
                                                <div>
                                                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide mb-1 flex items-center gap-1"><Bed className="h-3 w-3" /> إجازة مرضية</p>
                                                    <p className="text-sm bg-yellow-50 text-yellow-800 rounded-lg p-3 leading-relaxed">
                                                        <span className="font-bold">المدة:</span> {record.sickLeaveDays} يوم <br/>
                                                        {record.sickLeaveReason && <><span className="font-bold">السبب:</span> {record.sickLeaveReason}</>}
                                                    </p>
                                                </div>
                                            )}
                                            {record.referralTo && (
                                                <div>
                                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1"><ArrowRightLeft className="h-3 w-3" /> تحويل طبي</p>
                                                    <p className="text-sm bg-green-50 text-green-800 rounded-lg p-3 leading-relaxed">
                                                        <span className="font-bold">الجهة المحول إليها:</span> {record.referralTo} <br/>
                                                        {record.referralReason && <><span className="font-bold">سبب التحويل:</span> {record.referralReason}</>}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Specialized Medical Template Data */}
                                            {(() => {
                                                if (record.recordType !== 'lab_result' || !record.templateData) return null;
                                                const labData = Array.isArray(record.templateData) ? record.templateData : record.templateData.results;
                                                const labNotes = !Array.isArray(record.templateData) ? record.templateData.notes : null;

                                                if (!Array.isArray(labData) || labData.length === 0) return null;

                                                return (
                                                    <div className="mt-4 pt-4 border-t border-border/50">
                                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3 flex items-center gap-1"><FlaskConical className="h-4 w-4" /> نتائج الفحوصات</p>
                                                        <div className="overflow-x-auto rounded-lg border border-purple-100 shadow-sm mb-4">
                                                            <table className="w-full text-sm text-right">
                                                                <thead className="bg-purple-50 text-purple-800 border-b border-purple-100">
                                                                    <tr>
                                                                        <th className="px-4 py-3 font-bold whitespace-nowrap">اسم الفحص</th>
                                                                        <th className="px-4 py-3 font-bold whitespace-nowrap">النتيجة</th>
                                                                        <th className="px-4 py-3 font-bold whitespace-nowrap">المعدل الطبيعي</th>
                                                                        <th className="px-4 py-3 font-bold whitespace-nowrap">الوحدة</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-purple-50">
                                                                    {labData.map((test, idx) => (
                                                                        <tr key={idx} className={`hover:bg-purple-50/50 transition-colors ${test.flag && test.flag !== 'N' ? 'bg-red-50/30' : ''}`}>
                                                                            <td className="px-4 py-3 font-medium text-slate-800">{test.testName}</td>
                                                                            <td className="px-4 py-3">
                                                                                <span className={`font-bold ${test.flag === 'H' ? 'text-red-600' : test.flag === 'L' ? 'text-orange-500' : 'text-slate-700'}`}>
                                                                                    {test.result}
                                                                                    {test.flag && test.flag !== 'N' && (
                                                                                        <span className="ml-1 text-[10px] bg-white border px-1 rounded-sm">
                                                                                            {test.flag}
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-slate-500 font-mono text-xs" dir="ltr">{test.normalRange || '-'}</td>
                                                                            <td className="px-4 py-3 text-slate-500">{test.unit || '-'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        {labNotes && (
                                                            <div>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">ملاحظات المختبر</p>
                                                                <p className="text-sm bg-purple-50/50 text-purple-900 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{labNotes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {record.recordType !== 'lab_result' && record.templateData && Object.keys(record.templateData).length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-border/50">
                                                    <TemplateViewer 
                                                        templateData={record.templateData} 
                                                        specialty={record.appointment?.user?.clinic_specialty || record.treatingDoctor?.specialty || ''} 
                                                    />
                                                </div>
                                            )}

                                            {!record.diagnosis && !record.treatment && !record.sickLeaveDays && !record.referralTo && !record.templateData && (
                                                <p className="text-sm text-muted-foreground text-center py-2">لا توجد تفاصيل إضافية</p>
                                            )}

                                            {/* AI Advice Section */}
                                            {(record.diagnosis || record.treatment) && (
                                                <div className="border rounded-xl p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                                            </div>
                                                            <p className="text-sm font-bold text-violet-700 dark:text-violet-300">نصائح طبية ذكية</p>
                                                        </div>
                                                        {!advice && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-xs border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-300"
                                                                onClick={() => fetchAiAdvice(record)}
                                                            >
                                                                <Sparkles className="h-3 w-3 ml-1" />
                                                                اطلب نصائح AI
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {advice?.loading && (
                                                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            <span>جارٍ توليد نصائح مخصصة لك...</span>
                                                        </div>
                                                    )}

                                                    {advice?.advice && !advice.loading && (
                                                        <div className="text-sm text-violet-900 dark:text-violet-200 leading-relaxed whitespace-pre-wrap">
                                                            {advice.advice}
                                                        </div>
                                                    )}

                                                    {!advice && (
                                                        <p className="text-xs text-violet-500 dark:text-violet-400">
                                                            احصل على نصائح طبية مخصصة بناءً على تشخيصك وعلاجك بمساعدة الذكاء الاصطناعي.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {record.pdfUrl && (
                                                <a href="#" onClick={(e) => handleDownloadPdf(e, record.pdfUrl as string)}>
                                                    <Button size="sm" className="w-full gap-2" variant="outline">
                                                        <Download className="h-4 w-4" />
                                                        تنزيل الوثيقة PDF
                                                    </Button>
                                                </a>
                                            )}
                                        </CardContent>
                                    )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div >
    );
}
