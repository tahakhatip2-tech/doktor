import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';
import {
    MessageCircle,
    ChevronLeft,
    Pill,
    User as UserIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface PatientRow {
    patient: {
        id: number;
        fullName: string;
        phone: string;
        avatar?: string | null;
    };
    conversationId: number | null;
    lastMessage: {
        id: number;
        content: string;
        senderType: 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'BOT';
        createdAt: string;
    } | null;
    lastPrescriptionAt: string | null;
}

export default function PharmacyMessages() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { pharmacy, token, loading: authLoading } = usePharmacyAuth(true);

    const [rows, setRows] = useState<PatientRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/pharmacy/chat/patients`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRows(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: err?.response?.data?.message || 'تعذّر تحميل قائمة المرضى',
            });
        } finally {
            setLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        if (!authLoading && pharmacy) load();
    }, [load, authLoading, pharmacy]);

    if (authLoading || !pharmacy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-24 w-full max-w-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 max-w-3xl mx-auto" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-blue-900">الرسائل</h1>
                    <p className="text-sm text-blue-600/70 font-medium">تواصل مع المرضى بخصوص وصفاتهم</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                </div>
            ) : rows.length === 0 ? (
                <Card className="p-12 text-center rounded-3xl border-dashed">
                    <Pill className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-lg mb-2">لا توجد محادثات بعد</h3>
                    <p className="text-muted-foreground text-sm">
                        ستظهر هنا قائمة المرضى الذين لديهم وصفات مرتبطة بهذه الصيدلية.
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {rows.map((row) => {
                        const isUnread = row.lastMessage
                            && row.lastMessage.senderType === 'PATIENT';
                        const lastTime = row.lastMessage?.createdAt || row.lastPrescriptionAt;
                        const displayName = row.patient.fullName || 'مريض';
                        const firstLetter = displayName.charAt(0);

                        return (
                            <Card
                                key={row.patient.id}
                                className={`relative rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer ${isUnread ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200 hover:border-teal-300'}`}
                                onClick={() => navigate(`/pharmacy/messages/${row.patient.id}`)}
                            >
                                {isUnread && (
                                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-teal-500 to-blue-600" />
                                )}
                                <div className="p-4 flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5">
                                            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                {row.patient.avatar ? (
                                                    <img src={row.patient.avatar} alt={displayName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="font-black text-xl text-teal-700">{firstLetter}</span>
                                                )}
                                            </div>
                                        </div>
                                        {isUnread && (
                                            <div className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-teal-500 border-2 border-white shadow-sm animate-pulse" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className={`font-extrabold text-base truncate ${isUnread ? 'text-slate-900' : 'text-slate-800'}`}>
                                                {displayName}
                                            </p>
                                            {lastTime && (
                                                <span className="text-[11px] font-bold text-slate-400 flex-shrink-0 mr-2">
                                                    {formatDistanceToNow(new Date(lastTime), { locale: ar, addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {row.lastMessage ? (
                                                <>
                                                    {row.lastMessage.senderType === 'PHARMACY' && (
                                                        <span className="text-[11px] font-bold text-teal-600 flex-shrink-0">أنت:</span>
                                                    )}
                                                    <p className={`text-sm truncate w-full ${isUnread ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                                                        {row.lastMessage.content}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic flex items-center gap-1">
                                                    <Pill className="h-3.5 w-3.5" />
                                                    وصفة طبية جديدة — ابدأ المحادثة
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        {row.conversationId ? (
                                            <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">
                                                <MessageCircle className="h-3 w-3 ml-1" />
                                                محادثة
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                                <Pill className="h-3 w-3 ml-1" />
                                                وصفة
                                            </Badge>
                                        )}
                                        <ChevronLeft className="h-5 w-5 text-slate-400" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
