import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import {
    ArrowRight,
    Send,
    Building2,
    Bot,
    User,
    MessageCircle,
    Loader2,
} from 'lucide-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace(/\/api$/, '');

interface Message {
    id: number;
    content: string;
    senderType: 'DOCTOR' | 'PATIENT' | 'BOT';
    senderId?: number;
    isRead: boolean;
    createdAt: string;
}

interface Conversation {
    id: number;
    clinic: { id: number; name: string; clinic_name: string };
    patient: { id: number; fullName: string; phone: string };
    messages: Message[];
}

export default function PatientChat() {
    const { clinicId } = useParams<{ clinicId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { patient, token } = usePatientAuth(true);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── تحميل/إنشاء المحادثة ─────────────────────────────────────────────────
    const loadConversation = useCallback(async () => {
        if (!token || !clinicId) return;
        try {
            const res = await axios.get(
                `${API_URL}/patient/chat/clinics/${clinicId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversation(res.data);
            setMessages(res.data.messages || []);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل المحادثة' });
            navigate('/patient/clinics');
        } finally {
            setLoading(false);
        }
    }, [token, clinicId]);

    useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    // ── تمرير للأسفل تلقائياً ────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Socket.io Real-time ───────────────────────────────────────────────────
    useEffect(() => {
        if (!patient || !token || !conversation) return;

        const socket = io(SOCKET_URL, {
            query: { patientId: patient.id, type: 'patient' },
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('[PatientChat] Socket connected');
            // تمييز المحادثة كمقروءة
            axios.patch(
                `${API_URL}/patient/chat/conversations/${conversation.id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            ).catch(() => { });
        });

        socket.on('internal_message', (payload: { conversationId: number; message: Message }) => {
            if (payload.conversationId === conversation.id) {
                setMessages(prev => [...prev, payload.message]);
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [patient, token, conversation?.id]);

    // ── إرسال رسالة ──────────────────────────────────────────────────────────
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !conversation || !token || sending) return;

        const content = input.trim();
        setInput('');
        setSending(true);

        // Optimistic update
        const tempMsg: Message = {
            id: Date.now(),
            content,
            senderType: 'PATIENT',
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await axios.post(
                `${API_URL}/patient/chat/conversations/${conversation.id}/messages`,
                { content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // استبدل الرسالة المؤقتة بالفعلية
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
        } catch {
            // إزالة الرسالة المؤقتة
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            toast({ variant: 'destructive', title: 'فشل الإرسال', description: 'حاول مجدداً' });
            setInput(content);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const clinicDisplayName = conversation?.clinic?.clinic_name || conversation?.clinic?.name || 'العيادة';

    const getBubbleStyle = (type: Message['senderType']) => {
        if (type === 'PATIENT') return 'bg-primary text-white rounded-2xl rounded-tr-sm ml-auto';
        if (type === 'BOT') return 'bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl rounded-tl-sm';
        return 'bg-card border border-border rounded-2xl rounded-tl-sm';
    };

    const getSenderIcon = (type: Message['senderType']) => {
        if (type === 'PATIENT') return <User className="h-4 w-4" />;
        if (type === 'BOT') return <Bot className="h-4 w-4 text-amber-600" />;
        return <Building2 className="h-4 w-4 text-primary" />;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]" dir="rtl">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-xl"
                >
                    <ArrowRight className="h-5 w-5" />
                </Button>

                {loading ? (
                    <Skeleton className="h-10 w-48" />
                ) : (
                    <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">{clinicDisplayName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                                متاح للرد
                            </p>
                        </div>
                    </div>
                )}

                <Badge variant="secondary" className="text-xs gap-1">
                    <MessageCircle className="h-3 w-3" />
                    دردشة داخلية
                </Badge>
            </div>

            {/* ── Messages Area ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted/20">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className={`h-14 w-3/4 rounded-2xl ${i % 2 === 0 ? 'mr-auto' : ''}`} />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                            <MessageCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-lg">ابدأ المحادثة</p>
                            <p className="text-muted-foreground text-sm mt-1">
                                أرسل رسالتك لـ {clinicDisplayName} وسيردّ عليك في أقرب وقت
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                'flex gap-2 max-w-[80%]',
                                msg.senderType === 'PATIENT' ? 'flex-row-reverse mr-0 ml-auto' : 'flex-row'
                            )}
                        >
                            <div className={cn(
                                'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1',
                                msg.senderType === 'PATIENT'
                                    ? 'bg-primary/10 text-primary'
                                    : msg.senderType === 'BOT'
                                        ? 'bg-amber-100'
                                        : 'bg-primary/10'
                            )}>
                                {getSenderIcon(msg.senderType)}
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className={cn('px-4 py-3 text-sm leading-relaxed shadow-sm', getBubbleStyle(msg.senderType))}>
                                    {msg.content}
                                </div>
                                <span className={cn(
                                    'text-[10px] text-muted-foreground px-1',
                                    msg.senderType === 'PATIENT' ? 'text-right' : 'text-left'
                                )}>
                                    {format(new Date(msg.createdAt), 'hh:mm a', { locale: ar })}
                                    {msg.senderType === 'BOT' && ' · موظف آلي'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ───────────────────────────────────────────────── */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-3 px-4 py-3 border-t bg-background/95 backdrop-blur"
            >
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 rounded-2xl h-12 bg-muted/50 border-border/50 focus:border-primary/50"
                    disabled={loading || sending}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    dir="auto"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-2xl gradient-primary shadow-glow flex-shrink-0"
                    disabled={!input.trim() || loading || sending}
                >
                    {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5 rotate-180" />
                    )}
                </Button>
            </form>
        </div>
    );
}
