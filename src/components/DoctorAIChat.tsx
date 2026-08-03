import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Calendar, Search, Trash2, CalendarPlus, X } from 'lucide-react';
import { api, BASE_URL } from '@/lib/api';
import { toastWithSound } from '@/lib/toast-with-sound';

interface ChatMessage {
    role: 'doctor' | 'assistant';
    content: string;
    timestamp: string;
}

interface DoctorAIChatProps {
    onClose: () => void;
}

export default function DoctorAIChat({ onClose }: DoctorAIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const loadHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/whatsapp/doctor-chat/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const clearHistory = async () => {
        if (!confirm('هل أنت متأكد من مسح المحادثة؟')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${BASE_URL}/whatsapp/doctor-chat/history`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages([]);
            toastWithSound.success('تم مسح المحادثة');
        } catch (error) {
            toastWithSound.error('فشل مسح المحادثة');
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const newMsg: ChatMessage = { role: 'doctor', content: text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/whatsapp/doctor-command`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: text })
            });

            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }]);
            } else {
                toastWithSound.error('حدث خطأ أثناء معالجة الأمر');
            }
        } catch (error) {
            toastWithSound.error('فشل الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        setInput(action);
        sendMessage(action);
    };

    return (
        <Card className="h-full flex flex-col shadow-xl border-l border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="border-b pb-4 shrink-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">الموظف الذكي للعيادة</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">مساعدك الشخصي لإدارة المواعيد</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={clearHistory} title="مسح المحادثة">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} title="إغلاق">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground my-8">
                                <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>مرحباً يا دكتور. أنا الموظف الذكي الخاص بك.</p>
                                <p className="text-sm mt-1">اطلب مني أي شيء يتعلق بالمواعيد أو المرضى.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'doctor' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'doctor' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    {msg.role === 'doctor' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap ${msg.role === 'doctor' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 flex-row">
                                <div className="shrink-0 h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">يعالج الأمر...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background shrink-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('أعطني مواعيد اليوم')} className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20">
                            <Calendar className="h-3 w-3 mr-2" /> مواعيد اليوم
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('أعطني مواعيد غداً')} className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20">
                            <Calendar className="h-3 w-3 mr-2" /> مواعيد غداً
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction('أضف موعد غداً الساعة 10:00 باسم أحمد')} className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20">
                            <CalendarPlus className="h-3 w-3 mr-2" /> إضافة موعد
                        </Button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                        <Input
                            placeholder="اكتب أمرك هنا... (مثال: ألغِ موعد محمد)"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="bg-muted/50"
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || loading} className="shrink-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
