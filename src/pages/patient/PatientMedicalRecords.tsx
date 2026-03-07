import { useState, useEffect } from 'react';
import axios from 'axios';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Stethoscope, Calendar, Search, Download,
    ChevronDown, ChevronUp, ClipboardList, FlaskConical,
    Bed, ArrowRightLeft, Loader2, AlertCircle, FileX,
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(recordTypeMap).map(([key, val]) => {
                        const Icon = val.icon;
                        const count = records.filter(r => r.recordType === key).length;
                        return (
                            <Card key={key} className="text-center p-4">
                                <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-lg font-bold">{count}</p>
                                <p className="text-xs text-muted-foreground">{val.label}</p>
                            </Card>
                        );
                    })}
                </div>

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
                    <div className="space-y-3">
                        {filtered.map((record) => {
                            const typeInfo = recordTypeMap[record.recordType] || recordTypeMap['prescription'];
                            const statusInfo = statusMap[record.appointment?.status] || { label: record.appointment?.status, color: 'bg-gray-100 text-gray-700' };
                            const Icon = typeInfo.icon;
                            const isExpanded = expandedId === record.id;
                            const date = record.appointment?.appointmentDate
                                ? format(new Date(record.appointment.appointmentDate), 'dd MMMM yyyy', { locale: ar })
                                : '—';

                            return (
                                <Card key={record.id} className="overflow-hidden transition-all duration-300">
                                    <button className="w-full text-right" onClick={() => setExpandedId(isExpanded ? null : record.id)}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={`p-2 rounded-lg ${typeInfo.color} shrink-0`}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                                                        </div>
                                                        <CardTitle className="text-base">
                                                            {record.appointment?.doctor?.clinic_name || 'عيادة'}
                                                        </CardTitle>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {date}
                                                            </span>
                                                            {record.appointment?.doctor?.clinic_specialty && (
                                                                <span className="flex items-center gap-1">
                                                                    <Stethoscope className="h-3 w-3" />
                                                                    {record.appointment.doctor.clinic_specialty}
                                                                </span>
                                                            )}
                                                            {record.feeAmount && (
                                                                <span className="text-primary font-medium">
                                                                    {Number(record.feeAmount).toFixed(2)} د.أ
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-muted-foreground shrink-0 pt-1">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </CardHeader>
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div >
    );
}

