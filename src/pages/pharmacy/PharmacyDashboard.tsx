import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pill, CheckCircle2, Clock, Calendar, Search, Loader2, Stethoscope, User, Phone, FileText, Activity, ShieldCheck, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import QRScannerDialog from '@/components/pharmacy/QRScannerDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PharmacyDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispensingId, setDispensingId] = useState<number | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('pharmacy_token');
            const [statsRes, presRes] = await Promise.all([
                axios.get(`${API_URL}/pharmacy/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/pharmacy/prescriptions?status=PENDING`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setPrescriptions(presRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleDispense = async (id: number) => {
        try {
            setDispensingId(id);
            const token = localStorage.getItem('pharmacy_token');
            await axios.patch(`${API_URL}/pharmacy/prescriptions/${id}/dispense`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: 'تم صرف الوصفة',
                description: 'تم صرف الوصفة بنجاح وتحديث حالتها.',
            });
            fetchDashboardData();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: error.response?.data?.message || 'حدث خطأ أثناء صرف الوصفة'
            });
        } finally {
            setDispensingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
                <p className="text-slate-500">جاري تحميل لوحة التحكم...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 gap-2 h-11 px-6 rounded-xl"
                    onClick={() => setIsScannerOpen(true)}
                >
                    <Search className="h-5 w-5" />
                    مسح وصفة (QR)
                </Button>
            </div>

            {/* إحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* إجمالي الوصفات */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-emerald-50 font-medium text-sm">إجمالي الوصفات</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.totalPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Pill className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* قيد الانتظار */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-amber-50 font-medium text-sm">قيد الانتظار</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.pendingPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* مصروفة */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-blue-50 font-medium text-sm">تم الصرف</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.dispensedPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* وصفات اليوم */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-purple-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-fuchsia-50 font-medium text-sm">وصفات اليوم</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.todayPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* الوصفات الواردة */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">الوصفات الواردة مؤخراً</CardTitle>
                </CardHeader>
                <CardContent>
                    {prescriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Pill className="h-12 w-12 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">لا توجد وصفات قيد الانتظار</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((p) => (
                                <div key={p.id} className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                                قيد الانتظار
                                            </Badge>
                                            <span className="text-xs text-slate-500">
                                                {format(new Date(p.createdAt), 'dd MMM yyyy - hh:mm a', { locale: ar })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800">مريض: {p.patient?.name}</h3>
                                        <p className="text-sm text-slate-600">من العيادة: {p.doctor?.clinic_name || p.doctor?.name}</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-50"
                                            onClick={() => setSelectedPrescription(p)}
                                        >
                                            التفاصيل
                                        </Button>
                                        <Button 
                                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                            disabled={dispensingId === p.id}
                                            onClick={() => handleDispense(p.id)}
                                        >
                                            {dispensingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'صرف الوصفة'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <QRScannerDialog 
                isOpen={isScannerOpen} 
                onClose={() => setIsScannerOpen(false)} 
                onDispenseSuccess={fetchDashboardData}
            />

            <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl" dir="rtl">
                    <div className="flex flex-col">

                        {/* ═══════ HEADER: شعار العيادة + بيانات الطبيب ═══════ */}
                        <div className="relative bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] text-white overflow-hidden">
                            {/* خطوط الزخرفة */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'}}></div>
                            </div>
                            <div className="absolute -top-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-300/10 rounded-full blur-2xl"></div>

                            <div className="relative z-10 flex items-center justify-between p-6">
                                {/* يمين: شعار + اسم العيادة + الطبيب */}
                                <div className="flex items-center gap-4">
                                    {/* الشعار */}
                                    <div className="relative shrink-0">
                                        {selectedPrescription?.doctor?.clinic_logo ? (
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl ring-2 ring-blue-300/30">
                                                <img
                                                    src={selectedPrescription.doctor.clinic_logo}
                                                    alt="شعار العيادة"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm">
                                                <Stethoscope className="w-8 h-8 text-blue-200" />
                                            </div>
                                        )}
                                        {/* نقطة التحقق الخضراء */}
                                        <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                                            <ShieldCheck className="w-3 h-3 text-white" />
                                        </div>
                                    </div>

                                    {/* النصوص */}
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight leading-tight">
                                            {selectedPrescription?.doctor?.clinic_name || 'عيادة طبية'}
                                        </h2>
                                        {selectedPrescription?.doctor?.clinic_specialty && (
                                            <p className="text-blue-200/80 text-xs mt-0.5">
                                                {selectedPrescription.doctor.clinic_specialty}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                                <Stethoscope className="w-2.5 h-2.5 text-blue-200" />
                                            </div>
                                            <span className="text-blue-100 text-sm font-semibold">
                                                د. {selectedPrescription?.doctor?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* يسار: Rx كبيرة */}
                                <div className="text-left select-none">
                                    <span className="text-6xl font-black italic text-white/15 tracking-tighter leading-none">Rx</span>
                                    <div className="text-blue-200/50 text-xs text-center mt-1 font-medium tracking-wider">PRESCRIPTION</div>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ شريط بيانات المريض ═══════ */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2 text-slate-700">
                                <User className="w-4 h-4 text-[#3949ab]" />
                                <span className="font-bold text-sm">{selectedPrescription?.patient?.fullName || selectedPrescription?.patient?.name || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{selectedPrescription?.patient?.phone || 'غير متوفر'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{selectedPrescription?.createdAt ? format(new Date(selectedPrescription.createdAt), 'dd MMMM yyyy', { locale: ar }) : ''}</span>
                            </div>
                        </div>

                        {/* ═══════ جسم الوصفة: الأدوية ═══════ */}
                        <div className="p-6 bg-white max-h-72 overflow-y-auto">
                            <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-4 text-sm uppercase tracking-widest border-b border-dashed pb-3">
                                <Activity className="w-4 h-4 text-[#3949ab]" />
                                الأدوية الموصوفة
                            </h3>

                            <div className="space-y-3">
                                {selectedPrescription?.medications && (() => {
                                    try {
                                        const meds = typeof selectedPrescription.medications === 'string'
                                            ? JSON.parse(selectedPrescription.medications)
                                            : selectedPrescription.medications;

                                        if (Array.isArray(meds)) {
                                            return meds.map((med: any, idx: number) => (
                                                <div key={idx} className="group relative bg-gradient-to-l from-slate-50 to-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#3949ab]/30 transition-all duration-300">
                                                    {/* الشريط الجانبي الملون */}
                                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#3949ab] to-[#42a5f5] rounded-r-xl"></div>
                                                    <div className="mr-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <span className="font-black text-slate-800 text-base">{med.name}</span>
                                                            <Badge className="bg-[#3949ab]/10 text-[#3949ab] border-[#3949ab]/20 shrink-0 text-xs font-semibold">
                                                                {med.duration}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                                            <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                                <Pill className="w-3.5 h-3.5 text-[#3949ab]" />
                                                                <span>{med.dosage}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span>{med.frequency}</span>
                                                            </div>
                                                        </div>
                                                        {med.notes && (
                                                            <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-start gap-1.5">
                                                                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                <span>{med.notes}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ));
                                        }
                                    } catch (e) {
                                        return <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border">{selectedPrescription.medications}</p>;
                                    }
                                })()}
                            </div>

                            {selectedPrescription?.notes && (
                                <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-[#3949ab] shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-xs font-bold text-[#3949ab]">ملاحظات الطبيب: </span>
                                        <span className="text-sm text-slate-600">{selectedPrescription.notes}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ═══════ STAMP: الختم الاحترافي ═══════ */}
                        <div className="mx-6 mb-4 mt-2 flex items-center justify-center">
                            <div className="relative flex flex-col items-center">
                                {/* الختم الدائري */}
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    {/* الدائرة الخارجية */}
                                    <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-[#3949ab]/30"></div>
                                    <div className="absolute inset-1.5 rounded-full border-2 border-[#3949ab]/20"></div>
                                    {/* النص الدائري */}
                                    <svg className="absolute inset-0 w-full h-full animate-[spin_30s_linear_infinite]" viewBox="0 0 120 120">
                                        <defs>
                                            <path id="topCircle" d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" fill="none" />
                                        </defs>
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="#3949ab" strokeWidth="1" strokeDasharray="4 2" className="opacity-30" />
                                        <circle cx="60" cy="60" r="48" fill="none" stroke="#3949ab" strokeWidth="1.5" className="opacity-50" />
                                        <circle cx="60" cy="60" r="32" fill="none" stroke="#3949ab" strokeWidth="0.5" className="opacity-40" />
                                        
                                        <text className="fill-[#3949ab]" style={{fontSize: '8.5px', fontWeight: 'bold', letterSpacing: '2px'}}>
                                            <textPath href="#topCircle" startOffset="5%">
                                                {selectedPrescription?.doctor?.clinic_name || 'DOCTOR JO'} • {selectedPrescription?.doctor?.clinic_name || 'DOCTOR JO'} •
                                            </textPath>
                                        </text>
                                    </svg>
                                    {/* المحتوى الداخلي للختم */}
                                    <div className="text-center z-10 px-2 flex flex-col items-center">
                                        {selectedPrescription?.doctor?.clinic_logo ? (
                                            <img src={selectedPrescription.doctor.clinic_logo} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover border border-[#3949ab]/20 p-0.5 bg-white" alt="logo" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border border-[#3949ab]/20 bg-blue-50/50 flex items-center justify-center mb-1">
                                                <Stethoscope className="w-5 h-5 text-[#3949ab]/80" />
                                            </div>
                                        )}
                                        <div className="text-[7.5px] font-black text-[#3949ab] leading-none text-center bg-white/80 px-1 rounded-sm">
                                            {selectedPrescription?.doctor?.clinic_name?.split(' ').slice(0, 2).join(' ') || 'OFFICIAL'}
                                        </div>
                                        <div className="text-[5.5px] font-bold text-[#3949ab]/60 mt-0.5 tracking-widest uppercase">
                                            CERTIFIED
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ FOOTER: الإجراءات ═══════ */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <img src="/hakeem-logo.png" alt="Doctor Jo" className="w-10 h-10 object-contain drop-shadow-sm" />
                                <div className="text-xs text-slate-500 leading-relaxed border-r-2 border-slate-200 pr-3">
                                    <div className="font-bold text-slate-700">وثيقة طبية إلكترونية</div>
                                    <div className="text-slate-400">موثقة ومعتمدة عبر نظام DOCTOR JO</div>
                                </div>
                            </div>
                            <Button
                                className="bg-gradient-to-l from-[#1a237e] to-[#3949ab] hover:from-[#283593] hover:to-[#42a5f5] text-white px-7 h-11 text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-700/30 hover:-translate-y-0.5 transition-all group"
                                onClick={() => {
                                    handleDispense(selectedPrescription.id);
                                    setSelectedPrescription(null);
                                }}
                            >
                                <CheckCircle2 className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                                صرف الأدوية وتأكيد
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}