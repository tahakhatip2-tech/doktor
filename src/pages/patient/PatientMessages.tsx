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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Conversation {
    id: number;
    clinic: { id: number; name: string; clinic_name: string };
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <MessageCircle className="h-6 w-6 text-primary" />
                        رسائلي
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        محادثاتك مع العيادات داخل التطبيق
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/patient/clinics')}
                    className="gap-2"
                >
                    <Building2 className="h-4 w-4" />
                    تصفح العيادات
                </Button>
            </div>

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
                <div className="space-y-3">
                    {conversations.map(conv => {
                        const lastMsg = conv.messages?.[0];
                        const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderType !== 'PATIENT';
                        const clinicName = conv.clinic?.clinic_name || conv.clinic?.name || 'عيادة';

                        return (
                            <Card
                                key={conv.id}
                                className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
                                onClick={() => navigate(`/patient/chat/${conv.clinic.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        {isUnread && (
                                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`font-bold text-sm truncate ${isUnread ? 'text-primary' : ''}`}>
                                                {clinicName}
                                            </p>
                                            <span className="text-[11px] text-muted-foreground flex-shrink-0 mr-2">
                                                {conv.updatedAt && formatDistanceToNow(new Date(conv.updatedAt), { locale: ar, addSuffix: true })}
                                            </span>
                                        </div>

                                        {lastMsg ? (
                                            <div className="flex items-center gap-1">
                                                {lastMsg.senderType === 'BOT' && (
                                                    <Bot className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                                )}
                                                <p className={`text-xs truncate ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                    {lastMsg.senderType === 'PATIENT' ? '← أنت: ' : ''}
                                                    {lastMsg.content}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">ابدأ المحادثة...</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {isUnread && (
                                            <Badge className="bg-primary text-white text-xs h-5 px-1.5">جديد</Badge>
                                        )}
                                        <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
