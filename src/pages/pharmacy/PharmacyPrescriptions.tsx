import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';
import { Pill, CheckCircle2, Clock, Loader2, FileText, LayoutGrid, Send, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { HeroSection } from '@/components/HeroSection';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-600 border-amber-200' },
    SENT_TO_PHARMACY: { label: 'أرسلت للصيدلية', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    DISPENSED: { label: 'تم الصرف', className: 'bg-green-50 text-green-600 border-green-200' },
    REJECTED: { label: 'مرفوضة', className: 'bg-red-50 text-red-600 border-red-200' },
};

export default function PharmacyPrescriptions() {
    const { toast } = useToast();
    const { pharmacy, token, loading: authLoading } = usePharmacyAuth(true);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispensingId, setDispensingId] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('ALL');

    const load = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const url = filter === 'ALL'
                ? `${API_URL}/pharmacy/prescriptions`
                : `${API_URL}/pharmacy/prescriptions?status=${filter}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err?.response?.data?.message || 'فشل تحميل الوصفات' });
        } finally {
            setLoading(false);
        }
    }, [token, filter, toast]);

    useEffect(() => { if (!authLoading && pharmacy) load(); }, [load, authLoading, pharmacy]);

    const handleDispense = async (id: number) => {
        try {
            setDispensingId(id);
            await axios.patch(
                `${API_URL}/pharmacy/prescriptions/${id}/dispense`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            );
            toast({ title: 'تم صرف الوصفة' });
            load();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err?.response?.data?.message || 'فشل صرف الوصفة' });
        } finally {
            setDispensingId(null);
        }
    };

    const filters = [
        { key: 'ALL', label: 'الكل', icon: LayoutGrid, color: 'from-slate-500 to-slate-700', ring: 'ring-slate-400' },
        { key: 'PENDING', label: 'قيد الانتظار', icon: Clock, color: 'from-orange-400 to-orange-500', ring: 'ring-orange-400' },
        { key: 'SENT_TO_PHARMACY', label: 'أرسلت للصيدلية', icon: Send, color: 'from-blue-500 to-blue-600', ring: 'ring-blue-400' },
        { key: 'DISPENSED', label: 'تم الصرف', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-400' },
        { key: 'REJECTED', label: 'مرفوضة', icon: XCircle, color: 'from-purple-500 to-purple-600', ring: 'ring-purple-400' },
    ];

    return (
        <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in" dir="rtl">
            <HeroSection 
                pageTitle="الوصفات الطبية"
                doctorName="نظام الصيدلية"
                description="جميع الوصفات المرسلة إلى الصيدلية"
                isPharmacy={true}
                icon={FileText}
            />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 max-w-4xl mx-auto mb-6">
                {filters.map((f, idx) => {
                    const isActive = filter === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`relative group flex items-center justify-between w-full h-11 sm:h-12 rounded-full border-2 border-emerald-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 ${idx === 0 ? 'col-span-2 md:col-span-1' : ''} ${isActive ? `ring-2 ring-offset-2 ring-offset-slate-50 ${f.ring} shadow-[0_0_20px_rgba(0,0,0,0.15)]` : ''}`}
                        >
                            {/* Colored half (Right side in RTL) */}
                            <div className={`absolute right-0 top-0 bottom-0 w-[42%] bg-gradient-to-br ${f.color} shadow-[inset_0_-3px_8px_rgba(0,0,0,0.3)] opacity-95 group-hover:opacity-100 transition-opacity`}></div>
                            
                            {/* Inner glossy highlight for colored half */}
                            <div className="absolute right-0 top-0 w-[42%] h-[45%] bg-white/20 rounded-bl-full pointer-events-none"></div>

                            {/* Transparent Glass half (Left side in RTL) */}
                            <div className="absolute left-0 top-0 bottom-0 w-[58%] bg-white/30 backdrop-blur-xl shadow-[inset_0_0_15px_rgba(255,255,255,0.8)] border-r border-white/50"></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center w-full px-1">
                                <div className="w-[42%] flex justify-center text-white drop-shadow-md">
                                    <f.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="w-[58%] flex justify-center text-slate-800 font-extrabold text-[10px] sm:text-xs whitespace-nowrap px-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                                    {f.label}
                                </div>
                            </div>
                            
                            {/* Full Glossy reflection over everything */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/5 to-transparent w-full h-[45%] pointer-events-none rounded-t-full"></div>
                        </button>
                    )
                })}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
            ) : items.length === 0 ? (
                <Card className="p-12 text-center rounded-3xl border-dashed">
                    <Pill className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-lg mb-2">لا توجد وصفات</h3>
                    <p className="text-muted-foreground text-sm">ستظهر هنا الوصفات الطبية المرسلة إلى الصيدلية.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {items.map((p) => {
                        const status = STATUS_LABELS[p.status] || STATUS_LABELS.PENDING;
                        let meds: any[] = [];
                        try {
                            meds = typeof p.medications === 'string' ? JSON.parse(p.medications) : (p.medications || []);
                        } catch { meds = []; }
                        return (
                            <Card key={p.id} className="relative rounded-3xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white group">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-teal-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="pb-2 pt-5 px-5 sm:px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                        <div className="flex-1 pr-2">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-bold border-0 shadow-sm ${status.className}`}>
                                                    {p.status === 'PENDING' && <Clock className="h-3 w-3 ml-1.5" />}
                                                    {p.status === 'DISPENSED' && <CheckCircle2 className="h-3 w-3 ml-1.5" />}
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
                                                وصفة #{p.id} — {p.patient?.fullName || 'مريض غير معروف'}
                                            </CardTitle>
                                            <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                عن: {p.doctor?.clinic_name || p.doctor?.name} • {format(new Date(p.createdAt), 'dd MMM yyyy - hh:mm a', { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 sm:px-6 pb-5 space-y-4">
                                    {meds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {meds.map((m, i) => (
                                                <div key={i} className="inline-flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                    <Pill className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span>{m.name || m.medication || m}</span>
                                                    {m.dosage && <span className="opacity-60 font-medium">— {m.dosage}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {p.notes && (
                                        <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-100/50 p-3 rounded-2xl">
                                            <FileText className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-sm text-amber-800 font-medium">{p.notes}</p>
                                        </div>
                                    )}
                                    {(p.status === 'PENDING' || p.status === 'SENT_TO_PHARMACY') && (
                                        <Button
                                            onClick={() => handleDispense(p.id)}
                                            disabled={dispensingId === p.id}
                                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-full px-8 shadow-md hover:shadow-lg transition-all"
                                        >
                                            {dispensingId === p.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 ml-2" />
                                            )}
                                            تأكيد الصرف
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
