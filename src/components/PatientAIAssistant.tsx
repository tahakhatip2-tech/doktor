import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, X, Send, Sparkles, Calendar,
    MessageCircle, ChevronDown, Loader2, RotateCcw, Copy, Check,
    PlusCircle, Shield, Zap, Stethoscope, HeartPulse, Info
} from 'lucide-react';
import { usePatientAuth } from '@/hooks/usePatientAuth';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    quickReplies?: string[];
}

// ─── Categories ────────────────────────────────────────────────────────────────
interface Category {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    prompts: Array<{ label: string; prompt: string }>;
}

const CATEGORIES: Category[] = [
    {
        id: 'booking',
        label: 'الحجوزات',
        icon: <Calendar className="h-4 w-4" />,
        color: 'from-orange-500 to-orange-700',
        prompts: [
            { label: '📅 كيف أحجز؟', prompt: 'كيف يمكنني حجز موعد في العيادة؟' },
            { label: '⏰ أوقات الدوام', prompt: 'ما هي أوقات دوام العيادة؟' },
        ],
    },
    {
        id: 'medical',
        label: 'الاستشارات',
        icon: <Stethoscope className="h-4 w-4" />,
        color: 'from-amber-500 to-amber-700',
        prompts: [
            { label: '🤒 أين أذهب؟', prompt: 'لدي أعراض وأريد معرفة التخصص المناسب لي.' },
            { label: '📋 التحضير للزيارة', prompt: 'ماذا يجب أن أحضر معي في زيارتي الأولى للعيادة؟' },
        ],
    },
    {
        id: 'system',
        label: 'مساعدة',
        icon: <Info className="h-4 w-4" />,
        color: 'from-red-500 to-red-700',
        prompts: [
            { label: '❓ كيف أستخدم النظام؟', prompt: 'كيف أستخدم هذه البوابة كالمواعيد والملف الطبي؟' },
            { label: '💬 التواصل مع العيادة', prompt: 'كيف أتواصل مع الدعم الفني أو الاستقبال؟' },
        ],
    },
];

// ─── Gemini API ────────────────────────────────────────────────────────────────
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`;

async function callGemini(turns: { role: string; parts: { text: string }[] }[]): Promise<string> {
    if (!GEMINI_KEY) throw new Error('عذراً، خدمة الذكاء الاصطناعي غير متوفرة حالياً.');
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: turns,
            generationConfig: { temperature: 0.6, topP: 0.9, maxOutputTokens: 1024 },
        }),
    });
    if (!res.ok) {
        throw new Error('حدث خطأ في الاتصال بالسيرفر.');
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PatientAIAssistant() {
    const { patient } = usePatientAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showCategories, setShowCategories] = useState(true);
    const [hasNewMsg, setHasNewMsg] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const patientName = patient?.fullName?.split(' ')[0] || 'ضيفنا العزيز';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!isOpen) return;
        if (messages.length === 0) initWelcome();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen, isMinimized]);

    const initWelcome = useCallback(() => {
        const now = new Date();
        const hour = now.getHours();
        const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

        addMessage({
            role: 'assistant',
            content: `${greeting} ${patientName}! 👋

أنا **المرشد الصحي** الخاص بك في منصة Doctor Jo.
كيف يمكنني مساعدتك اليوم؟

يمكنني إرشادك حول:
👨‍⚕️ التخصص المناسب لحالتك
📅 كيفية حجز المواعيد
📱 طريقة استخدام النظام

تفضل، اسألني ما تريد!`,
            quickReplies: ['كيف أحجز موعد؟', 'لدي أعراض، أين أذهب؟'],
        });
    }, [patientName]);

    const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
        setMessages(prev => [...prev, {
            id: `${msg.role}-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            ...msg,
        }]);
    }, []);

    const buildSystemPrompt = useCallback(() => {
        return `أنت مرشد صحي ذكي ولطيف موجه للمرضى في منصة "Doctor Jo". 
تتحدث الآن مع المريض واسمه: ${patientName}.

مهمتك:
1. توجيه المريض لكيفية استخدام نظام الحجوزات، العثور على العيادات، أو إدارة ملفه.
2. إذا ذكر المريض أعراضاً، قدم له نصائح طبية **عامة جداً وبسيطة** وانصحه بزيارة التخصص المناسب في منصتنا.
3. التنبيه دائماً أنك "مساعد ذكي" ولست طبيباً للتشخيص النهائي.
4. الرد بأسلوب لطيف، مطَمْئن، ومختصر باللغة العربية، ونادِ المريض باسمه أحياناً.
5. يمكنك اقتراح خيارات سريعة للمريض باستخدام العلامة 🔹 في سطر جديد. (مثال: 🔹 كيف أبحث عن عيادة؟)`;
    }, [patientName]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        setShowCategories(false);
        addMessage({ role: 'user', content: text.trim() });
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = buildSystemPrompt();

            const history = messages
                .filter(m => m.id !== messages[0]?.id)
                .slice(-8)
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }],
                }));

            const turns = [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: `مفهوم، أنا المرشد الصحي في منصة Doctor Jo. جاهز لخدمة المريض ${patientName}.` }] },
                ...history,
                { role: 'user', parts: [{ text: text.trim() }] },
            ];

            const rawText = await callGemini(turns);
            
            const quickReplies: string[] = [];
            const cleanText = rawText.replace(/^🔹\s*.+$/gm, (line) => {
                quickReplies.push(line.replace(/^🔹\s*/, '').trim());
                return '';
            }).trim();

            setMessages(prev => [...prev, {
                id: `a-${Date.now()}`,
                role: 'assistant',
                content: cleanText || rawText,
                timestamp: new Date(),
                quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
            }]);

        } catch (err: any) {
            addMessage({
                role: 'assistant',
                content: `⚠️ عذراً، لا أستطيع الرد حالياً. يرجى المحاولة لاحقاً.`,
            });
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoading, messages, buildSystemPrompt, addMessage, patientName]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const clearChat = () => {
        setMessages([]);
        setShowCategories(true);
        setActiveCategory(null);
        setTimeout(initWelcome, 50);
    };

    const renderContent = (text: string) => {
        return text.split('\n').map((line, i) => {
            const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
            if (line.startsWith('• ') || line.startsWith('- ')) {
                return (
                    <div key={i} className="flex items-start gap-2 my-0.5">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-50" />
                        <span dangerouslySetInnerHTML={{ __html: bold.slice(2) }} />
                    </div>
                );
            }
            if (line === '') return <div key={i} className="h-1.5" />;
            return <div key={i} dangerouslySetInnerHTML={{ __html: bold }} />;
        });
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        id="patient-ai-assistant-trigger"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setIsOpen(true); setIsMinimized(false); setHasNewMsg(false); }}
                        className="fixed bottom-24 left-4 z-50 flex items-center justify-center h-14 w-14
                            rounded-full bg-orange-500 text-white shadow-xl shadow-orange-500/40 
                            hover:shadow-orange-500/60 transition-all duration-300 group"
                    >
                        <span className="absolute -inset-1.5 rounded-full animate-ping bg-orange-400/30 pointer-events-none" />
                        <Bot className="h-7 w-7 text-white" />
                        <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                        {hasNewMsg && (
                            <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow">!</span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 16 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        className={`fixed z-50 flex flex-col overflow-hidden
                            bg-white dark:bg-slate-900
                            border border-slate-200 dark:border-slate-700
                            shadow-2xl shadow-orange-500/20
                            ${isMinimized 
                                ? 'bottom-24 left-4 w-72 rounded-3xl' 
                                : 'bottom-0 left-0 right-0 w-full h-[85dvh] rounded-t-3xl sm:bottom-24 sm:left-4 sm:right-auto sm:w-[420px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-3xl'
                            }
                        `}
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 bg-gradient-to-l from-orange-600 via-orange-500 to-amber-500 px-4 py-3.5 shadow-md z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <HeartPulse className="h-5 w-5 text-white" />
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-orange-600 shadow-sm" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-white font-black text-sm tracking-wide">المرشد الصحي</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-emerald-200 text-[11px] font-bold">● متصل الآن</span>
                                            <span className="text-white/80 text-[10px]">(Doctor Jo)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={clearChat} className="h-7 w-7 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => setIsMinimized(p => !p)} className="h-7 w-7 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all">
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="h-7 w-7 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {showCategories && (
                                    <div className="flex-shrink-0 px-3 pt-3 pb-1">
                                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                                            {CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                                                        activeCategory === cat.id
                                                            ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-sm`
                                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {cat.icon}
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {activeCategory && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                                                        {CATEGORIES.find(c => c.id === activeCategory)?.prompts.map((p, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => { setActiveCategory(null); sendMessage(p.prompt); }}
                                                                className="text-right px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all leading-snug"
                                                            >
                                                                {p.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
                                    <AnimatePresence initial={false}>
                                        {messages.map(msg => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {msg.role === 'assistant' && (
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center mt-0.5 shadow-sm">
                                                        <Bot className="h-4 w-4 text-white" />
                                                    </div>
                                                )}

                                                <div className={`flex-1 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                                    <div className={`relative group max-w-[92%] ${
                                                        msg.role === 'user'
                                                            ? 'bg-orange-500 text-white rounded-2xl rounded-tl-sm px-4 py-2.5'
                                                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm'
                                                    }`}>
                                                        <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                                                            {renderContent(msg.content)}
                                                        </div>

                                                        {msg.quickReplies && msg.quickReplies.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                                {msg.quickReplies.map((qr, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => sendMessage(qr)}
                                                                        disabled={isLoading}
                                                                        className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-[11px] font-bold hover:bg-orange-100 active:scale-95 transition-all disabled:opacity-40"
                                                                    >
                                                                        {qr}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {msg.role === 'assistant' && (
                                                            <button
                                                                onClick={() => handleCopy(msg.id, msg.content)}
                                                                className="absolute -top-2.5 -left-2.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm"
                                                            >
                                                                {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <p className={`text-[9px] mt-1 text-slate-400 ${msg.role === 'user' ? 'text-left' : ''}`}>
                                                        {msg.timestamp.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                                            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-4 w-4 text-white animate-pulse" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm flex items-center justify-center">
                                                <div className="flex gap-1.5 items-center">
                                                    {[0, 150, 300].map(delay => (
                                                        <span key={delay} className="h-2 w-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-3 z-10 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 px-3 py-2 shadow-sm
                                        focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 transition-all">
                                        
                                        <button
                                            type="button"
                                            className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all mb-0.5"
                                        >
                                            <PlusCircle className="h-5 w-5" />
                                        </button>

                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="اسأل المرشد الصحي..."
                                            rows={1}
                                            disabled={isLoading}
                                            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none outline-none leading-relaxed max-h-28 py-1.5 disabled:opacity-50"
                                            style={{ direction: 'rtl' }}
                                        />
                                        
                                        <button
                                            onClick={() => sendMessage(input)}
                                            disabled={!input.trim() || isLoading}
                                            className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-white mb-0.5 transition-all
                                                ${input.trim() && !isLoading 
                                                    ? 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/30 active:scale-95' 
                                                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}`}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 px-1">
                                        <button
                                            onClick={() => setShowCategories(p => !p)}
                                            className="flex items-center gap-1 text-[10px] text-orange-600 hover:text-orange-700 font-bold bg-orange-50 px-2 py-1 rounded-md"
                                        >
                                            <Zap className="h-3 w-3" />
                                            الأسئلة الشائعة
                                        </button>
                                        <p className="text-[9px] text-slate-400 select-none flex items-center gap-1">
                                            <Shield className="h-3 w-3 opacity-50" />
                                            سري ومشفر
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
