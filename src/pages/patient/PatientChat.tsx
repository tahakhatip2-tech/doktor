import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import {
    ArrowRight,
    Send,
    Bot,
    User,
    Loader2,
    MessageCircle,
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
    clinic: {
        id: number;
        name: string;
        clinic_name: string;
        clinic_specialty?: string;
        clinic_logo?: string;
    };
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
            transports: ['polling', 'websocket'], // البدء بـ polling للمزيد من الاستقرار مع ngrok
            extraHeaders: {
                'ngrok-skip-browser-warning': 'true',
                'bypass-tunnel-reminder': 'true'
            },
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
    const doctorImage = conversation?.clinic?.clinic_logo;
    const clinicSpecialty = conversation?.clinic?.clinic_specialty;
    const firstLetter = clinicDisplayName.charAt(0);

    const getBubbleStyle = (type: Message['senderType']) => {
        if (type === 'PATIENT') return 'bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-2xl rounded-tl-sm shadow-sm';
        if (type === 'BOT') return 'bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl rounded-tr-sm shadow-sm';
        return 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tr-sm shadow-sm';
    };

    const getSenderIcon = (type: Message['senderType']) => {
        if (type === 'PATIENT') {
            if (patient?.avatar) {
                return <img src={patient.avatar} alt="Patient" className="h-full w-full object-cover rounded-xl" />;
            }
            const initial = patient?.fullName?.charAt(0) || 'م';
            return <span className="font-bold text-sm text-blue-600">{initial}</span>;
        }
        if (type === 'BOT') return <Bot className="h-4 w-4 text-orange-600" />;
        return doctorImage ? (
            <img src={doctorImage} alt="Dr" className="h-full w-full object-cover rounded-xl" />
        ) : (
            <span className="font-bold text-sm text-blue-800">{firstLetter}</span>
        );
    };

    return (
        <div className="flex flex-col" dir="rtl" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center gap-4 px-4 py-3 border-b bg-white shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-xl hover:bg-slate-100/50"
                >
                    <ArrowRight className="h-5 w-5 text-slate-600" />
                </Button>

                {loading ? (
                    <Skeleton className="h-10 w-48" />
                ) : (
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative h-11 w-11 rounded-xl bg-gradient-to-tr from-orange-500 to-blue-600 p-0.5 flex flex-shrink-0 items-center justify-center shadow-sm">
                            <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                                {doctorImage ? (
                                    <img src={doctorImage} alt={clinicDisplayName} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="font-bold text-lg text-blue-800">{firstLetter}</span>
                                )}
                            </div>
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-900 text-sm">{clinicDisplayName}</p>
                            {clinicSpecialty && (
                                <p className="text-[11px] font-bold text-orange-500">{clinicSpecialty}</p>
                            )}
                            <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                متاح للرد
                            </p>
                        </div>
                    </div>
                )}

            </div>

            {/* ── Messages Area ───────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50/50">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className={`h-14 w-3/4 rounded-2xl ${i % 2 === 0 ? 'mr-auto' : ''}`} />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <MessageCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-800 text-lg">ابدأ المحادثة</p>
                            <p className="text-slate-500 font-medium text-sm mt-1">
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
                                msg.senderType === 'PATIENT' ? 'flex-row-reverse mr-auto ml-0' : 'flex-row ml-auto mr-0'
                            )}
                        >
                            <div className={cn(
                                'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm overflow-hidden border',
                                msg.senderType === 'PATIENT'
                                    ? 'bg-blue-100 text-blue-600 border-blue-200'
                                    : msg.senderType === 'BOT'
                                        ? 'bg-orange-100 text-orange-600 border-orange-200'
                                        : 'bg-white border-slate-200'
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
                className="flex items-center gap-3 px-4 py-3 border-t bg-white sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
            >
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 rounded-full h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white shadow-inner font-medium"
                    disabled={loading || sending}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    dir="auto"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 flex-shrink-0 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white"
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
