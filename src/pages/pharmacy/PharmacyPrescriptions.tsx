import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';
import { Pill, CheckCircle2, Clock, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'قيد الانتظار', className: 'bg-amber-50 text-amber-600 border-amber-200' },
    SENT_TO_PHARMACY: { label: 'أرسلت للصيدلية', className: 'bg-blue-50 text-blue-600 border-blue-200' },
    DISPENSED: { label: 'مصروفة', className: 'bg-green-50 text-green-600 border-green-200' },
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
            await axios.post(
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
        { key: 'ALL', label: 'الكل' },
        { key: 'PENDING', label: 'الانتظار' },
        { key: 'SENT_TO_PHARMACY', label: 'أرسلت' },
        { key: 'DISPENSED', label: 'مصروفة' },
        { key: 'REJECTED', label: 'مرفوضة' },
    ];

    return (
        <div className="space-y-6 pb-24 max-w-4xl mx-auto" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-blue-900">الوصفات الطبية</h1>
                    <p className="text-sm text-blue-600/70 font-medium">جميع الوصفات المرسلة إلى الصيدلية</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                    <Button
                        key={f.key}
                        size="sm"
                        variant={filter === f.key ? 'default' : 'outline'}
                        onClick={() => setFilter(f.key)}
                        className="rounded-xl font-bold"
                    >
                        {f.label}
                    </Button>
                ))}
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
                            <Card key={p.id} className="rounded-2xl border-slate-200 hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-base font-black text-slate-800">
                                                وصفة #{p.id} — {p.patient?.fullName || 'مريض'}
                                            </CardTitle>
                                            <p className="text-xs text-slate-500 mt-1">
                                                من: {p.doctor?.clinic_name || p.doctor?.name} • {format(new Date(p.createdAt), 'dd MMM yyyy - hh:mm a', { locale: ar })}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={status.className}>
                                            {p.status === 'PENDING' && <Clock className="h-3 w-3 ml-1" />}
                                            {p.status === 'DISPENSED' && <CheckCircle2 className="h-3 w-3 ml-1" />}
                                            {status.label}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {meds.length > 0 && (
                                        <div className="space-y-1.5">
                                            {meds.slice(0, 3).map((m, i) => (
                                                <div key={i} className="text-sm flex items-center gap-2">
                                                    <Pill className="h-3.5 w-3.5 text-teal-500" />
                                                    <span className="font-bold text-slate-700">{m.name || m.medication || m}</span>
                                                    {m.dosage && <span className="text-slate-500">— {m.dosage}</span>}
                                                </div>
                                            ))}
                                            {meds.length > 3 && <p className="text-xs text-slate-400">+ {meds.length - 3} أدوية أخرى</p>}
                                        </div>
                                    )}
                                    {p.notes && (
                                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">📝 {p.notes}</p>
                                    )}
                                    {(p.status === 'PENDING' || p.status === 'SENT_TO_PHARMACY') && (
                                        <Button
                                            onClick={() => handleDispense(p.id)}
                                            disabled={dispensingId === p.id}
                                            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-xl"
                                        >
                                            {dispensingId === p.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 ml-2" />
                                            )}
                                            صرف الوصفة
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
