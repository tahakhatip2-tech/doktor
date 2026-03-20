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
import PatientHero from '@/components/patient/PatientHero';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const recordTypeMap: Record<string, { label: string; icon: any; color: string }> = {
    prescription: { label: 'وصفة طبية', icon: ClipboardList, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    lab_report: { label: 'تقرير مختبر', icon: FlaskConical, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    sick_leave: { label: 'إجازة مرضية', icon: Bed, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    referral: { label: 'تحويل طبي', icon: ArrowRightLeft, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
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
    appointment: {
        appointmentDate: string;
        customerName: string;
        status: string;
        doctor?: { name: string; clinic_name: string; clinic_specialty: string };
    };
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

    const filtered = records.filter((r) => {
        const q = search.toLowerCase();
        return (
            r.appointment?.doctor?.clinic_name?.toLowerCase().includes(q) ||
            r.appointment?.doctor?.clinic_specialty?.toLowerCase().includes(q) ||
            r.diagnosis?.toLowerCase().includes(q) ||
            recordTypeMap[r.recordType]?.label.includes(q)
        );
    });

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

                {/* Summary Cards */}
                <motion.div 
                    initial="hidden" animate="visible" 
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                    {Object.entries(recordTypeMap).map(([key, val]) => {
                        const Icon = val.icon;
                        const count = records.filter(r => r.recordType === key).length;
                        return (
                            <motion.div key={key} variants={{ hidden: { y: 20, opacity: 0, scale: 0.8 }, visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 250, damping: 20 } } }}>
                                <Card className="p-3 bg-white shadow-sm hover:shadow-md border border-blue-100 hover:border-orange-500 rounded-2xl transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center gap-2">
                                    <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300 group-hover:-rotate-6 shadow-sm">
                                        <Icon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl md:text-2xl font-black text-blue-950 font-display leading-none">{count}</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 mt-1 truncate">{val.label}</p>
                                    </div>
                                </Card>
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
                                                    <div className="relative h-12 w-12 rounded-xl bg-white p-0.5 z-10 flex items-center justify-center">
                                                        <div className={`h-full w-full rounded-[10px] flex items-center justify-center overflow-hidden border border-white ${typeInfo.color}`}>
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
                                                        {record.appointment?.doctor?.clinic_name || 'عيادة طبية'}
                                                    </h4>
                                                    
                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                        <p className="text-xs text-orange-600 font-bold flex items-center gap-1.5 truncate bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100">
                                                            <Stethoscope className="h-3 w-3" />
                                                            <span>{record.appointment?.doctor?.clinic_specialty || 'سجل طبي'}</span>
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
                                            {record.diagnosis && (
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">التشخيص</p>
                                                    <p className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed">{record.diagnosis}</p>
                                                </div>
                                            )}
                                            {record.treatment && (
                                                <div>
                                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">العلاج والتعليمات</p>
                                                    <p className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{record.treatment}</p>
                                                </div>
                                            )}
                                            {!record.diagnosis && !record.treatment && (
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
                                                <a href={`${API_URL.replace('/api', '')}${record.pdfUrl}`} target="_blank" rel="noopener noreferrer">
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
