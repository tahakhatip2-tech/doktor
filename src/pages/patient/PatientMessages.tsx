import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useToast } from '@/hooks/use-toast';
import {
    MessageCircle,
    Building2,
    ChevronLeft,
    Bot,
} from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import PatientHero from '@/components/patient/PatientHero';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Conversation {
    id: number;
    clinic: {
        id: number;
        name: string;
        clinic_name: string;
        clinic_specialty?: string;
        clinic_logo?: string;
    };
    messages: Array<{
        id: number;
        content: string;
        senderType: 'DOCTOR' | 'PATIENT' | 'BOT';
        isRead: boolean;
        createdAt: string;
    }>;
    updatedAt: string;
}

export default function PatientMessages() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { token } = usePatientAuth(true);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const loadConversations = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/patient/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConversations(res.data || []);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل المحادثات' });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    return (
        <div className="space-y-6 animate-fade-in" dir="rtl">
            {/* Hero Section */}
            <PatientHero
                showBackButton={true}
                title="محادثاتي"
                subtitle="تواصل مع أطبائك"
                description="محادثاتك المباشرة والآمنة مع العيادات داخل التطبيق."
                badgeText={conversations.length > 0 ? `${conversations.length} محادثات مسجلة` : "لا توجد محادثات"}
            >
                <Button
                    variant="default"
                    size="default"
                    onClick={() => navigate('/patient/clinics')}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-xl backdrop-blur-md rounded-2xl h-11 px-6 font-bold flex items-center gap-2"
                >
                    <Building2 className="h-4 w-4" />
                    تصفح العيادات
                </Button>
            </PatientHero>

            <div className="px-4 sm:px-0 space-y-6">
                {/* Conversations List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                ) : conversations.length === 0 ? (
                    <Card className="p-12 text-center rounded-3xl border-dashed">
                        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="font-bold text-lg mb-2">لا توجد محادثات بعد</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            يمكنك بدء محادثة مع أي عيادة من صفحة العيادات
                        </p>
                        <Button onClick={() => navigate('/patient/clinics')} className="gradient-primary text-white">
                            <Building2 className="h-4 w-4 ml-2" />
                            تصفح العيادات
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {conversations.map(conv => {
                            const lastMsg = conv.messages?.[0];
                            const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderType !== 'PATIENT';
                            const clinicName = conv.clinic?.clinic_name || conv.clinic?.name || 'عيادة';
                            const doctorImage = conv.clinic?.clinic_logo;
                            const specialty = conv.clinic?.clinic_specialty;
                            const firstLetter = clinicName.charAt(0);

                            return (
                                <Card
                                    key={conv.id}
                                    className={`relative rounded-md border bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group ${isUnread ? 'border-orange-500 bg-orange-50/20' : 'border-slate-200 hover:border-blue-300'}`}
                                    onClick={() => navigate(`/patient/chat/${conv.clinic.id}`)}
                                >
                                    {isUnread && (
                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-blue-600"></div>
                                    )}
                                    <div className="p-4 flex items-center gap-4">
                                        
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full blur-[4px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative h-14 w-14 rounded-full bg-white p-0.5 z-10 flex flex-shrink-0 items-center justify-center">
                                                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center overflow-hidden border border-white text-blue-800 font-black text-xl">
                                                    {doctorImage ? (
                                                        <img src={doctorImage} alt={clinicName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        firstLetter
                                                    )}
                                                </div>
                                            </div>
                                            {isUnread && (
                                                <div className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-orange-500 border-2 border-white z-20 shadow-sm animate-pulse" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className={`font-extrabold text-base truncate ${isUnread ? 'text-slate-900' : 'text-slate-800'}`}>
                                                    {clinicName}
                                                </p>
                                                <span className="text-[11px] font-bold text-slate-400 flex-shrink-0 mr-2">
                                                    {conv.updatedAt && formatDistanceToNow(new Date(conv.updatedAt), { locale: ar, addSuffix: true })}
                                                </span>
                                            </div>
                                            {specialty && (
                                                <span className="text-[11px] font-bold text-orange-500 mb-1">{specialty}</span>
                                            )}

                                            {lastMsg ? (
                                                <div className="flex items-center gap-1.5">
                                                    {lastMsg.senderType === 'BOT' ? (
                                                        <Bot className="h-4 w-4 text-orange-400 flex-shrink-0" />
                                                    ) : lastMsg.senderType === 'PATIENT' ? (
                                                        <span className="text-xs font-bold text-slate-400 shrink-0">أنت:</span>
                                                    ) : null}
                                                    <p className={`text-sm truncate w-full ${isUnread ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                                                        {lastMsg.content}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">ابدأ المحادثة...</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors">
                                            <ChevronLeft className="h-5 w-5" />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
