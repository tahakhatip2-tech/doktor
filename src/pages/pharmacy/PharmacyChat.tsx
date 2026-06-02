import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';
import {
    ArrowRight,
    Send,
    Pill,
    User as UserIcon,
    Loader2,
    MessageCircle,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace(/\/api$/, '');

interface Message {
    id: number;
    content: string;
    senderType: 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'BOT';
    senderId?: number;
    isRead: boolean;
    createdAt: string;
}

interface Conversation {
    id: number;
    clinicId: number;
    patient: { id: number; fullName: string; phone: string; avatar?: string | null };
    messages: Message[];
}

export default function PharmacyChat() {
    const { patientId } = useParams<{ patientId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { pharmacy, token, loading: authLoading } = usePharmacyAuth(true);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadConversation = useCallback(async () => {
        if (!token || !patientId) return;
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_URL}/pharmacy/chat/conversations/${patientId}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setConversation(res.data);
            setMessages(res.data.messages || []);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: err?.response?.data?.message || 'تعذّر تحميل المحادثة',
            });
            navigate('/pharmacy/messages');
        } finally {
            setLoading(false);
        }
    }, [token, patientId, toast, navigate]);

    useEffect(() => {
        if (!authLoading && pharmacy) loadConversation();
    }, [loadConversation, authLoading, pharmacy]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time updates via socket
    useEffect(() => {
        if (!pharmacy || !token || !conversation) return;

        const socket = io(SOCKET_URL, {
            query: { userId: pharmacy.id, type: 'user' },
            auth: { token },
            transports: ['polling', 'websocket'],
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true',
                'bypass-tunnel-reminder': 'true',
            },
        });

        socket.on('connect', () => {
            axios.patch(
                `${API_URL}/pharmacy/chat/conversations/${conversation.id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } },
            ).catch(() => { });
        });

        socket.on('patient_notification', (payload: any) => {
            if (payload?.type === 'PHARMACY_MESSAGE_ECHO' && payload?.conversationId === conversation.id) {
                setMessages(prev => {
                    if (prev.find(m => m.id === payload.message.id)) return prev;
                    return [...prev, payload.message];
                });
            }
        });

        socketRef.current = socket;
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [pharmacy, token, conversation?.id]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !conversation || !token || sending) return;

        const content = input.trim();
        setInput('');
        setSending(true);

        const tempMsg: Message = {
            id: Date.now(),
            content,
            senderType: 'PHARMACY',
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await axios.post(
                `${API_URL}/pharmacy/chat/messages/${conversation.id}`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            toast({ variant: 'destructive', title: 'فشل الإرسال', description: 'حاول مجدداً' });
            setInput(content);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const patientName = conversation?.patient?.fullName || 'مريض';
    const patientAvatar = conversation?.patient?.avatar;
    const firstLetter = patientName.charAt(0);

    return (
        <div className="flex flex-col" dir="rtl" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="flex-shrink-0 flex items-center gap-4 px-4 py-3 border-b bg-white shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/pharmacy/messages')}
                    className="rounded-xl hover:bg-slate-100/50"
                >
                    <ArrowRight className="h-5 w-5 text-slate-600" />
                </Button>

                {loading ? (
                    <Skeleton className="h-10 w-48" />
                ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5 flex-shrink-0">
                            <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                                {patientAvatar ? (
                                    <img src={patientAvatar} alt={patientName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="font-bold text-lg text-teal-700">{firstLetter}</span>
                                )}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 text-sm truncate">{patientName}</p>
                            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1" dir="ltr">
                                <UserIcon className="h-3 w-3" />
                                {conversation?.patient?.phone}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50/50">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className={`h-14 w-3/4 rounded-2xl ${i % 2 === 0 ? 'mr-auto' : ''}`} />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <MessageCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-800 text-lg">ابدأ المحادثة</p>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                أرسل رسالة للمريض بخصوص وصفته الطبية
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderType === 'PHARMACY' || msg.senderType === 'DOCTOR';
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex gap-2 max-w-[80%]',
                                    isMine ? 'flex-row-reverse mr-auto ml-0' : 'flex-row ml-auto mr-0',
                                )}
                            >
                                <div className={cn(
                                    'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm overflow-hidden border',
                                    isMine
                                        ? 'bg-teal-100 text-teal-600 border-teal-200'
                                        : 'bg-white border-slate-200',
                                )}>
                                    {isMine ? (
                                        <Pill className="h-4 w-4" />
                                    ) : patientAvatar ? (
                                        <img src={patientAvatar} alt={patientName} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-sm text-slate-600">{firstLetter}</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className={cn(
                                        'px-4 py-3 text-sm leading-relaxed shadow-sm',
                                        isMine
                                            ? 'bg-gradient-to-l from-teal-600 to-teal-500 text-white rounded-2xl rounded-tl-sm'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tr-sm',
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className={cn(
                                        'text-[10px] text-muted-foreground px-1',
                                        isMine ? 'text-right' : 'text-left',
                                    )}>
                                        {format(new Date(msg.createdAt), 'hh:mm a', { locale: ar })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSend}
                className="flex items-center gap-3 px-4 py-3 border-t bg-white sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
            >
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="اكتب رسالتك للمريض..."
                    className="flex-1 rounded-full h-12 bg-slate-50 border-slate-200 focus:border-teal-500 focus:bg-white shadow-inner font-medium"
                    disabled={loading || sending}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    dir="auto"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 shadow-lg shadow-teal-500/30 flex-shrink-0 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white"
                    disabled={!input.trim() || loading || sending}
                >
                    {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5 rtl:rotate-180" />
                    )}
                </Button>
            </form>
        </div>
    );
}
