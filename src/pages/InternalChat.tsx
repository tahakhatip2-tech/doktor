import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Send,
    MessageCircle,
    User,
    Bot,
    Building2,
    Loader2,
    Search,
    RefreshCw,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace(/\/api$/, '');

interface Message {
    id: number;
    content: string;
    senderType: 'DOCTOR' | 'PATIENT' | 'BOT';
    isRead: boolean;
    createdAt: string;
}

interface Conversation {
    id: number;
    patient: { id: number; fullName: string; phone: string };
    messages: Message[];
    updatedAt: string;
}

export default function InternalChat() {
    const { toast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');
    const [unreadTotal, setUnreadTotal] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── تحميل قائمة المحادثات ────────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        try {
            const data = await apiFetch('/internal-chat/conversations');
            setConversations(data || []);

            const countData = await apiFetch('/internal-chat/unread-count');
            setUnreadTotal(countData || 0);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل المحادثات' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // ── تحميل رسائل محادثة بعينها ────────────────────────────────────────────
    const loadMessages = async (conv: Conversation) => {
        setSelectedConv(conv);
        setLoadingMessages(true);
        try {
            const data = await apiFetch(`/internal-chat/conversations/${conv.id}`);
            setMessages(data.messages || []);

            // تمييز كمقروء
            await apiFetch(`/internal-chat/conversations/${conv.id}/read`, { method: 'PATCH' }).catch(() => { });

            // تحديث المحادثات (إزالة علامة الإشعار)
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c } : c)
            );
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل الرسائل' });
        } finally {
            setLoadingMessages(false);
        }
    };

    // ── تمرير للأسفل ─────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Socket.io للطبيب ─────────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) return;
        const user = JSON.parse(userStr);

        const socket = io(SOCKET_URL, {
            query: { userId: user.id },
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => console.log('[DoctorChat] Socket connected'));

        socket.on('internal_message', (payload: { conversationId: number; message: Message }) => {
            // إذا المحادثة مفتوحة — أضف الرسالة
            setSelectedConv(prev => {
                if (prev?.id === payload.conversationId) {
                    setMessages(msgs => [...msgs, payload.message]);
                    // تمييز كمقروء
                    apiFetch(`/internal-chat/conversations/${payload.conversationId}/read`, { method: 'PATCH' }).catch(() => { });
                }
                return prev;
            });

            // تحديث قائمة المحادثات
            setConversations(prev =>
                prev.map(c =>
                    c.id === payload.conversationId
                        ? { ...c, messages: [payload.message], updatedAt: new Date().toISOString() }
                        : c
                ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            );
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); socketRef.current = null; };
    }, []);

    // ── إرسال رسالة ──────────────────────────────────────────────────────────
    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || !selectedConv || sending) return;

        const content = input.trim();
        setInput('');
        setSending(true);

        const tempMsg: Message = {
            id: Date.now(),
            content,
            senderType: 'DOCTOR',
            isRead: false,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await apiFetch(
                `/internal-chat/conversations/${selectedConv.id}/messages`,
                { method: 'POST', body: JSON.stringify({ content }) }
            );
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res : m));
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setInput(content);
            toast({ variant: 'destructive', title: 'فشل الإرسال' });
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const filtered = conversations.filter(c =>
        c.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.patient?.phone?.includes(search)
    );

    const getBubbleStyle = (type: Message['senderType']) => {
        if (type === 'DOCTOR') return 'bg-primary text-white rounded-2xl rounded-tr-sm ml-auto';
        if (type === 'BOT') return 'bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl rounded-tl-sm';
        return 'bg-card border border-border rounded-2xl rounded-tl-sm';
    };

    return (
        <div className="flex h-[calc(100vh-160px)] gap-0 rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-background" dir="rtl">

            {/* ── Sidebar: قائمة المحادثات ───────────────────────────────── */}
            <div className="w-80 flex-shrink-0 border-l border-border/50 flex flex-col bg-card/50">
                {/* Header */}
                <div className="px-4 py-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-black text-lg flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-primary" />
                                الدردشة الداخلية
                            </h3>
                            {unreadTotal > 0 && (
                                <Badge className="bg-destructive text-white text-xs mt-0.5">
                                    {unreadTotal} رسالة جديدة
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" onClick={loadConversations} className="rounded-xl">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="بحث عن مريض..."
                            className="h-9 pr-9 rounded-xl bg-muted/50 border-border/50 text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">لا توجد محادثات بعد</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">ستظهر هنا عند مراسلة المرضى</p>
                        </div>
                    ) : (
                        filtered.map(conv => {
                            const lastMsg = conv.messages?.[0];
                            const isSelected = selectedConv?.id === conv.id;
                            const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderType === 'PATIENT';
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => loadMessages(conv)}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-border/30 hover:bg-primary/5',
                                        isSelected && 'bg-primary/10 border-r-2 border-r-primary'
                                    )}
                                >
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                                            {conv.patient?.fullName?.[0] || 'م'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={cn('text-sm font-bold truncate', isUnread && 'text-primary')}>
                                                {conv.patient?.fullName || 'مريض'}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                                {conv.updatedAt && formatDistanceToNow(new Date(conv.updatedAt), { locale: ar, addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={cn('text-xs truncate mt-0.5', isUnread ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                                            {lastMsg
                                                ? `${lastMsg.senderType === 'DOCTOR' ? '← ' : ''}${lastMsg.content}`
                                                : 'ابدأ المحادثة...'
                                            }
                                        </p>
                                    </div>
                                    {isUnread && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Chat Area ───────────────────────────────────────────────── */}
            {selectedConv ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-background/80 backdrop-blur">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                                {selectedConv.patient?.fullName?.[0] || 'م'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold text-sm">{selectedConv.patient?.fullName}</p>
                            <p className="text-xs text-muted-foreground" dir="ltr">{selectedConv.patient?.phone}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-muted/10">
                        {loadingMessages ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className={`h-14 w-3/4 rounded-2xl ${i % 2 === 0 ? 'mr-auto' : ''}`} />)}
                            </div>
                        ) : (
                            messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        'flex gap-2 max-w-[75%]',
                                        msg.senderType === 'DOCTOR' ? 'flex-row-reverse mr-0 ml-auto' : 'flex-row'
                                    )}
                                >
                                    <div className={cn(
                                        'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1',
                                        msg.senderType === 'DOCTOR' ? 'bg-primary/10' : msg.senderType === 'BOT' ? 'bg-amber-100' : 'bg-muted'
                                    )}>
                                        {msg.senderType === 'DOCTOR' ? <Building2 className="h-4 w-4 text-primary" />
                                            : msg.senderType === 'BOT' ? <Bot className="h-4 w-4 text-amber-600" />
                                                : <User className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className={cn('px-4 py-3 text-sm leading-relaxed shadow-sm', getBubbleStyle(msg.senderType))}>
                                            {msg.content}
                                        </div>
                                        <span className={cn('text-[10px] text-muted-foreground px-1', msg.senderType === 'DOCTOR' ? 'text-right' : 'text-left')}>
                                            {format(new Date(msg.createdAt), 'hh:mm a', { locale: ar })}
                                            {msg.senderType === 'BOT' && ' · موظف آلي'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="flex items-center gap-3 px-5 py-3 border-t border-border/50 bg-background/80 backdrop-blur">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={`رد على ${selectedConv.patient?.fullName}...`}
                            className="flex-1 rounded-2xl h-12 bg-muted/50 border-border/50"
                            disabled={sending}
                            dir="auto"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 rounded-2xl gradient-primary shadow-glow flex-shrink-0"
                            disabled={!input.trim() || sending}
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 rotate-180" />}
                        </Button>
                    </form>
                </div>
            ) : (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-muted/10">
                    <div className="h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center shadow-glow">
                        <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-2">الدردشة الداخلية</h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            اختر محادثة من القائمة على اليمين للرد على المرضى مباشرة داخل التطبيق
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                        <Badge variant="outline" className="gap-1"><Bot className="h-3 w-3 text-amber-500" /> ردود آلية عند الغياب</Badge>
                        <Badge variant="outline" className="gap-1"><MessageCircle className="h-3 w-3 text-primary" /> إشعارات فورية</Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
