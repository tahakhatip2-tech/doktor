import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, X, Send, Sparkles, Calendar, CalendarX, CalendarCheck,
    Users, Star, Clock, TrendingUp, MessageCircle, ChevronDown,
    Loader2, RotateCcw, Copy, Check, AlertTriangle, DollarSign,
    Stethoscope, BarChart2, Settings2, Lightbulb, Phone,
    CheckCircle2, XCircle, Trash2, PlusCircle, Bell, FileText,
    ChevronRight, Shield, Zap, Heart,
} from 'lucide-react';
import { useClinicContext } from '@/context/ClinicContext';
import { appointmentsApi, dataApi, contactsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ActionBlock {
    action: string;
    appointmentId?: number;
    appointmentIds?: number[];
    status?: string;
    patientName?: string;
    phone?: string;
    date?: string;
    time?: string;
    notes?: string;
    confirmMessage: string;
    successMessage: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;          // display text (JSON stripped)
    rawContent?: string;       // original AI text including JSON
    timestamp: Date;
    actionBlock?: ActionBlock; // parsed pending action
    actionStatus?: 'pending' | 'confirmed' | 'rejected' | 'executing' | 'done' | 'error';
    actionError?: string;
    quickReplies?: string[];
}

interface ClinicData {
    stats: any;
    appointments: any[];
    contacts: any[];
    fetchedAt: number;
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
        id: 'appointments',
        label: 'المواعيد',
        icon: <Calendar className="h-4 w-4" />,
        color: 'from-blue-500 to-blue-700',
        prompts: [
            { label: '📅 مواعيد اليوم', prompt: 'أعطني ملخصاً كاملاً لمواعيد اليوم مع الأسماء والأوقات والحالات' },
            { label: '⏳ المواعيد المعلقة', prompt: 'اعرض لي جميع المواعيد التي بانتظار التأكيد' },
            { label: '❌ إلغاء مواعيد ملغاة', prompt: 'اعرض المواعيد الملغاة الأخيرة' },
            { label: '✅ تأكيد جميع المعلقة', prompt: 'أريد تأكيد جميع المواعيد المعلقة الآن' },
        ],
    },
    {
        id: 'analytics',
        label: 'التحليلات',
        icon: <BarChart2 className="h-4 w-4" />,
        color: 'from-purple-500 to-purple-700',
        prompts: [
            { label: '📊 تقرير شامل', prompt: 'أعطني تقريراً شاملاً عن أداء العيادة هذا الشهر' },
            { label: '📈 أوقات الذروة', prompt: 'حلل أوقات الذروة في العيادة وأخبرني متى أكون أكثر ازدحاماً' },
            { label: '💰 تحليل مالي', prompt: 'حلل الأداء المالي للعيادة وأعطني توقعات الأرباح' },
            { label: '🔄 معدل الإلغاء', prompt: 'ما معدل إلغاء المواعيد وكيف أقلله؟' },
        ],
    },
    {
        id: 'advice',
        label: 'النصائح',
        icon: <Lightbulb className="h-4 w-4" />,
        color: 'from-amber-500 to-orange-600',
        prompts: [
            { label: '💡 تحسين الأداء', prompt: 'أعطني 5 نصائح احترافية لتحسين كفاءة العيادة وإنتاجيتها' },
            { label: '👥 إدارة الموظفين', prompt: 'نصائح لإدارة الموظفين والفريق الطبي في العيادة' },
            { label: '⭐ رضا المرضى', prompt: 'كيف أحسن تجربة المريض وأزيد رضاه؟ نصائح عملية' },
            { label: '📱 التسويق الرقمي', prompt: 'استراتيجيات التسويق الرقمي لجذب مرضى جدد للعيادة' },
        ],
    },
    {
        id: 'patients',
        label: 'المرضى',
        icon: <Users className="h-4 w-4" />,
        color: 'from-green-500 to-emerald-700',
        prompts: [
            { label: '🆕 إضافة موعد', prompt: 'أريد إضافة موعد جديد. ما المعلومات المطلوبة؟' },
            { label: '📋 آخر المرضى', prompt: 'من آخر المرضى الذين زاروا العيادة؟' },
            { label: '💬 تواصل مع مريض', prompt: 'أريد إرسال رسالة تذكير لمرضى موعد الغد' },
            { label: '🔍 بحث عن مريض', prompt: 'كيف أجد معلومات مريض معين؟' },
        ],
    },
    {
        id: 'clinic',
        label: 'العيادة',
        icon: <Stethoscope className="h-4 w-4" />,
        color: 'from-teal-500 to-cyan-700',
        prompts: [
            { label: '⚙️ إعدادات العيادة', prompt: 'ما الإعدادات الحالية للعيادة وكيف يمكنني تحسينها؟' },
            { label: '🕐 جدول العمل المثالي', prompt: 'ساعدني في وضع جدول عمل مثالي للعيادة' },
            { label: '📋 بروتوكولات', prompt: 'ما البروتوكولات الطبية الموصى بها لعيادتي؟' },
            { label: '🏥 تطوير الخدمات', prompt: 'كيف أطور خدمات العيادة وأضيف تخصصات جديدة؟' },
        ],
    },
];

// ─── Gemini API ────────────────────────────────────────────────────────────────
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`;

async function callGemini(turns: { role: string; parts: { text: string }[] }[]): Promise<string> {
    if (!GEMINI_KEY) throw new Error('مفتاح Gemini API غير موجود. يرجى إضافة VITE_GEMINI_API_KEY في ملف .env');
    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: turns,
            generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─── Parse AI response for action blocks ──────────────────────────────────────
function parseActionBlock(text: string): { displayText: string; action?: ActionBlock } {
    const jsonMatch = text.match(/```action\s*([\s\S]*?)```/);
    if (!jsonMatch) return { displayText: text };
    try {
        const action = JSON.parse(jsonMatch[1].trim()) as ActionBlock;
        const displayText = text.replace(/```action[\s\S]*?```/, '').trim();
        return { displayText, action };
    } catch {
        return { displayText: text };
    }
}

// ─── Clinic data cache (5 min) ────────────────────────────────────────────────
let _dataCache: ClinicData | null = null;

async function loadClinicData(): Promise<ClinicData> {
    const now = Date.now();
    if (_dataCache && now - _dataCache.fetchedAt < 5 * 60 * 1000) return _dataCache;
    try {
        const [stats, appointments, contacts] = await Promise.all([
            appointmentsApi.getStats(),
            appointmentsApi.getAll(),
            contactsApi.getAll().catch(() => []),
        ]);
        _dataCache = {
            stats,
            appointments: Array.isArray(appointments) ? appointments : [],
            contacts: Array.isArray(contacts) ? contacts : [],
            fetchedAt: now,
        };
        return _dataCache;
    } catch {
        return { stats: null, appointments: [], contacts: [], fetchedAt: now };
    }
}

function invalidateCache() { _dataCache = null; }

// ─── Format appointment date ───────────────────────────────────────────────────
function fmtDate(d: string) {
    try {
        return new Date(d).toLocaleDateString('ar-JO', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return d; }
}
function fmtTime(d: string) {
    try {
        return new Date(d).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DoctorAISecretary() {
    const { settings } = useClinicContext();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [clinicData, setClinicData] = useState<ClinicData | null>(null);
    const [showCategories, setShowCategories] = useState(true);
    const [hasNewMsg, setHasNewMsg] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const doctorName = settings?.doctor_name || 'الطبيب';
    const clinicName = settings?.clinic_name || 'العيادة';

    // ── Scroll to bottom ───────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Load data when opened ──────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        if (messages.length === 0) initWelcome();
        setIsDataLoading(true);
        loadClinicData().then(d => { setClinicData(d); setIsDataLoading(false); });
    }, [isOpen]);

    // ── Focus input ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen, isMinimized]);

    // ── Welcome ────────────────────────────────────────────────────────────────
    const initWelcome = useCallback(() => {
        const now = new Date();
        const hour = now.getHours();
        const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

        addMessage({
            role: 'assistant',
            content: `${greeting} د. ${doctorName}! 👋

أنا **سكرتيرك الذكي المتكامل** لعيادة **${clinicName}**.

يمكنني **تنفيذ** كل ما يخص إدارة عيادتك:

📅 **المواعيد** — تأكيد، إلغاء، إنشاء، عرض جدول
📊 **التحليلات** — تقارير، إحصائيات، أوقات ذروة
💡 **النصائح** — إدارة الموظفين، رضا المرضى، تطوير الخدمات
👥 **المرضى** — البحث، التواصل، المتابعة
⚙️ **العيادة** — إعدادات، بروتوكولات، تطوير

اختر قسماً من الأسفل أو اكتب طلبك مباشرة!`,
            quickReplies: ['مواعيد اليوم', 'المواعيد المعلقة', 'تقرير سريع', 'نصائح للأداء'],
        });
    }, [doctorName, clinicName]);

    // ── Add message helper ─────────────────────────────────────────────────────
    const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
        setMessages(prev => [...prev, {
            id: `${msg.role}-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            ...msg,
        }]);
    }, []);

    // ── Build system prompt ────────────────────────────────────────────────────
    const buildSystemPrompt = useCallback(() => {
        const now = new Date();
        const today = now.toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const todayISO = now.toISOString().split('T')[0];

        let statsBlock = '❌ لا تتوفر إحصائيات';
        let todayApptBlock = '❌ لا توجد مواعيد اليوم';
        let pendingBlock = '❌ لا توجد مواعيد معلقة';
        let allApptSample = '❌ لا تتوفر مواعيد';

        if (clinicData) {
            const s = clinicData.stats;
            if (s) {
                statsBlock = `
إجمالي المرضى: ${s.total_patients ?? s.totalPatients ?? 0}
مواعيد اليوم الإجمالية: ${s.today_total ?? 0}
مواعيد اليوم المكتملة: ${s.today_completed ?? 0}
مواعيد اليوم في الانتظار: ${s.today_waiting ?? 0}
مواعيد الشهر: ${s.this_month ?? 0}
مواعيد الشهر المكتملة: ${s.this_month_completed ?? 0}
متوسط التقييم: ${s.avgRating ?? 'غير محدد'}`.trim();
            }

            const appts = clinicData.appointments;
            if (appts.length > 0) {
                const todayAppts = appts.filter(a => {
                    const d = a.appointment_date || a.appointmentDate || '';
                    return d.startsWith(todayISO);
                });

                if (todayAppts.length > 0) {
                    todayApptBlock = todayAppts.map(a =>
                        `[ID:${a.id}] ${a.patient_name || a.customerName || 'مريض'} | ${a.appointment_time || fmtTime(a.appointment_date || '')} | ${a.status} | ${a.phone || a.chat_phone || 'بدون هاتف'}`
                    ).join('\n');
                }

                const pending = appts.filter(a => a.status === 'pending');
                if (pending.length > 0) {
                    pendingBlock = pending.map(a =>
                        `[ID:${a.id}] ${a.patient_name || a.customerName || 'مريض'} | ${fmtDate(a.appointment_date || '')} ${a.appointment_time || ''} | ${a.phone || ''}`
                    ).join('\n');
                }

                // Sample of all appointments for context
                allApptSample = appts.slice(0, 20).map(a =>
                    `[ID:${a.id}] ${a.patient_name || a.customerName || 'مريض'} | ${fmtDate(a.appointment_date || '')} ${a.appointment_time || ''} | حالة: ${a.status}`
                ).join('\n');
            }
        }

        return `أنت سكرتير ذكي احترافي متقدم، اسمك "مساعد Doctor Jo"، تعمل لصالح:
- الطبيب: د. ${doctorName}
- العيادة: ${clinicName}
- ساعات العمل: ${settings?.working_hours_start ?? '?'} - ${settings?.working_hours_end ?? '?'}
- مدة الموعد: ${settings?.appointment_duration ?? 30} دقيقة
- التاريخ/الوقت الحالي: ${today} - ${now.toLocaleTimeString('ar-JO')}

══════════════════════════════
📊 إحصائيات العيادة:
${statsBlock}

📅 مواعيد اليوم:
${todayApptBlock}

⏳ المواعيد المعلقة (تحتاج تأكيد):
${pendingBlock}

📋 عينة من المواعيد الأخيرة:
${allApptSample}
══════════════════════════════

🔧 صلاحياتك (يمكنك تنفيذها):
1. confirm_appointment — تأكيد موعد (يرسل إشعار للمريض تلقائياً)
2. cancel_appointment — إلغاء موعد (مع سبب اختياري)
3. confirm_all_pending — تأكيد جميع المواعيد المعلقة
4. cancel_all_pending — إلغاء جميع المواعيد المعلقة
5. create_appointment — إنشاء موعد جديد (يحتاج: اسم المريض، الهاتف، التاريخ، الوقت)
6. delete_appointment — حذف موعد نهائياً

══════════════════════════════
📜 قواعد الرد:

1. أجب دائماً بالعربية الفصحى المبسطة، وكن واضحاً ومباشراً.
2. استخدم الإيموجي المناسبة لجعل الردود حيوية.
3. عندما يطلب الطبيب تنفيذ إجراء (تأكيد/إلغاء/إنشاء موعد):
   أ) اشرح ما ستفعله بوضوح في النص العادي
   ب) أضف كتلة الإجراء بالشكل التالي بعد ردك:
   
\`\`\`action
{
  "action": "confirm_appointment",
  "appointmentId": 123,
  "confirmMessage": "تأكيد موعد [اسم المريض] في [الوقت]؟",
  "successMessage": "✅ تم تأكيد موعد [اسم المريض] وإشعار المريض!"
}
\`\`\`

4. للإجراءات الجماعية استخدم "appointmentIds" (مصفوفة من IDs).
5. لإنشاء موعد جديد أضف جميع الحقول: patientName, phone, date, time, notes.
6. إذا لم تجد معرّف الموعد في البيانات، أخبر الطبيب بذلك بوضوح واطلب منه التوضيح.
7. قدم دائماً نصائح وإرشادات ذات قيمة حقيقية بناءً على بيانات العيادة الفعلية.
8. عند الحديث عن إحصائيات، اذكر الأرقام الحقيقية من البيانات.
9. كن استباقياً واقترح إجراءات مفيدة حتى لو لم يطلبها الطبيب.`;
    }, [clinicData, doctorName, clinicName, settings]);

    // ── Execute action ─────────────────────────────────────────────────────────
    const executeAction = useCallback(async (msgId: string, action: ActionBlock) => {
        // Mark as executing
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, actionStatus: 'executing' } : m
        ));

        try {
            let result: any;

            switch (action.action) {
                case 'confirm_appointment':
                    result = await appointmentsApi.updateStatus(action.appointmentId!, 'confirmed');
                    break;

                case 'cancel_appointment':
                    result = await appointmentsApi.updateStatus(action.appointmentId!, 'cancelled');
                    break;

                case 'confirm_all_pending': {
                    const pending = (clinicData?.appointments || []).filter(a => a.status === 'pending');
                    await Promise.all(pending.map(a => appointmentsApi.updateStatus(a.id, 'confirmed')));
                    result = { count: pending.length };
                    break;
                }

                case 'cancel_all_pending': {
                    const pending = (clinicData?.appointments || []).filter(a => a.status === 'pending');
                    await Promise.all(pending.map(a => appointmentsApi.updateStatus(a.id, 'cancelled')));
                    result = { count: pending.length };
                    break;
                }

                case 'confirm_appointments':
                case 'cancel_appointments': {
                    const newStatus = action.action === 'confirm_appointments' ? 'confirmed' : 'cancelled';
                    await Promise.all((action.appointmentIds || []).map(id =>
                        appointmentsApi.updateStatus(id, newStatus)
                    ));
                    result = { count: action.appointmentIds?.length };
                    break;
                }

                case 'create_appointment': {
                    result = await appointmentsApi.create({
                        patient_name: action.patientName,
                        phone: action.phone,
                        appointment_date: action.date,
                        appointment_time: action.time,
                        notes: action.notes || '',
                        status: 'confirmed',
                    });
                    break;
                }

                case 'delete_appointment':
                    await appointmentsApi.delete(action.appointmentId!);
                    result = { deleted: true };
                    break;

                default:
                    throw new Error(`إجراء غير معروف: ${action.action}`);
            }

            // Invalidate cache after mutation
            invalidateCache();
            loadClinicData().then(setClinicData);

            // Mark done
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, actionStatus: 'done' } : m
            ));

            toast({ title: action.successMessage, variant: 'default' });

            // Follow-up message
            addMessage({
                role: 'assistant',
                content: `✅ ${action.successMessage}\n\nهل تريد إجراء أي شيء آخر؟`,
                quickReplies: ['مواعيد اليوم', 'المواعيد المعلقة', 'تقرير سريع'],
            });

        } catch (err: any) {
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, actionStatus: 'error', actionError: err.message } : m
            ));
            toast({ title: `فشل تنفيذ الإجراء: ${err.message}`, variant: 'destructive' });
        }
    }, [clinicData, addMessage, toast]);

    // ── Send message ───────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        setShowCategories(false);
        addMessage({ role: 'user', content: text.trim() });
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = buildSystemPrompt();

            // Build conversation history
            const history = messages
                .filter(m => m.id !== messages[0]?.id) // skip welcome
                .slice(-12) // keep last 12 messages for context
                .map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }],
                }));

            const turns = [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: `مفهوم تماماً. أنا مساعد Doctor Jo الذكي لعيادة ${clinicName}، جاهز للمساعدة.` }] },
                ...history,
                { role: 'user', parts: [{ text: text.trim() }] },
            ];

            const raw = await callGemini(turns);
            const { displayText, action } = parseActionBlock(raw);

            // Extract quick replies suggestion from display text (lines starting with "🔹")
            const quickReplies: string[] = [];
            const cleanText = displayText.replace(/^🔹\s*.+$/gm, (line) => {
                quickReplies.push(line.replace(/^🔹\s*/, '').trim());
                return '';
            }).trim();

            const msgId = `a-${Date.now()}`;
            setMessages(prev => [...prev, {
                id: msgId,
                role: 'assistant',
                content: cleanText || displayText,
                rawContent: raw,
                timestamp: new Date(),
                actionBlock: action,
                actionStatus: action ? 'pending' : undefined,
                quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
            }]);

        } catch (err: any) {
            addMessage({
                role: 'assistant',
                content: `⚠️ **حدث خطأ:**\n${err.message}\n\nيرجى التحقق من مفتاح Gemini API في الإعدادات.`,
            });
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isLoading, messages, buildSystemPrompt, addMessage, clinicName]);

    // ── Keyboard handler ───────────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    // ── Copy ───────────────────────────────────────────────────────────────────
    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    // ── Clear chat ─────────────────────────────────────────────────────────────
    const clearChat = () => {
        setMessages([]);
        setShowCategories(true);
        setActiveCategory(null);
        setTimeout(initWelcome, 50);
    };

    // ── Render message content (basic markdown) ────────────────────────────────
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

    // ── Action block renderer ──────────────────────────────────────────────────
    const renderActionBlock = (msg: Message) => {
        const { actionBlock, actionStatus, actionError, id } = msg;
        if (!actionBlock) return null;

        const statusConfig = {
            pending: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, label: 'تأكيد الإجراء' },
            executing: { bg: 'bg-blue-50 border-blue-200', icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />, label: 'جاري التنفيذ...' },
            done: { bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, label: 'تم بنجاح' },
            error: { bg: 'bg-red-50 border-red-200', icon: <XCircle className="h-4 w-4 text-red-500" />, label: 'فشل التنفيذ' },
            rejected: { bg: 'bg-slate-50 border-slate-200', icon: <XCircle className="h-4 w-4 text-slate-400" />, label: 'تم الإلغاء' },
            confirmed: { bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, label: 'تم التأكيد' },
        };

        const cfg = statusConfig[actionStatus || 'pending'];

        return (
            <div className={`mt-3 rounded-xl border p-3 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                    {cfg.icon}
                    <span className="text-xs font-bold text-slate-700">{cfg.label}</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{actionBlock.confirmMessage}</p>
                {actionStatus === 'error' && (
                    <p className="text-xs text-red-500 mb-2">❌ {actionError}</p>
                )}
                {actionStatus === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => executeAction(id, actionBlock)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg
                                bg-indigo-600 text-white text-xs font-bold
                                hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            <Check className="h-3.5 w-3.5" />
                            تأكيد التنفيذ
                        </button>
                        <button
                            onClick={() => setMessages(prev => prev.map(m =>
                                m.id === id ? { ...m, actionStatus: 'rejected' } : m
                            ))}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg
                                bg-white border border-slate-200 text-slate-600 text-xs font-bold
                                hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <X className="h-3.5 w-3.5" />
                            إلغاء
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* ── Floating Button ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        id="doctor-ai-secretary-trigger"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setIsOpen(true); setIsMinimized(false); setHasNewMsg(false); }}
                        className="fixed bottom-24 left-4 z-50 flex items-center justify-center h-14 w-14
                            rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/40 
                            hover:shadow-blue-500/60 transition-all duration-300 group"
                    >
                        {/* Outer pulse */}
                        <span className="absolute -inset-1.5 rounded-full animate-ping bg-blue-400/30 pointer-events-none" />

                        {/* Icon */}
                        <Bot className="h-7 w-7 text-white" />

                        {/* Online Indicator */}
                        <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />

                        {/* Badge */}
                        {hasNewMsg && (
                            <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow">!</span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Panel ──────────────────────────────────────────────────── */}
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
                            shadow-2xl shadow-blue-500/20
                            ${isMinimized 
                                ? 'bottom-24 left-4 w-72 rounded-3xl' 
                                : 'bottom-0 left-0 right-0 w-full h-[85dvh] rounded-t-3xl sm:bottom-24 sm:left-4 sm:right-auto sm:w-[420px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-3xl'
                            }
                        `}
                        dir="rtl"
                    >
                        {/* ══ Header ══════════════════════════════════════════ */}
                        <div className="flex-shrink-0 bg-gradient-to-l from-blue-700 via-blue-600 to-sky-600 px-4 py-3.5 shadow-md z-10">
                            <div className="flex items-center justify-between">
                                {/* Identity */}
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        <Bot className="h-6 w-6 text-white" />
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-blue-600 shadow-sm" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-white font-black text-sm tracking-wide">السكرتير الذكي <span className="opacity-70 text-[10px] font-normal tracking-normal">(Doctor Jo)</span></p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {isDataLoading
                                                ? <><Loader2 className="h-3 w-3 text-white/80 animate-spin" /><span className="text-white/80 text-[11px] font-medium">يحدث البيانات...</span></>
                                                : <><span className="text-emerald-300 text-[11px] font-bold">● متصل الآن</span><span className="text-white/60 text-[10px]">({clinicName})</span></>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1">
                                    <button onClick={clearChat} title="محادثة جديدة" className="h-7 w-7 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => setIsMinimized(p => !p)} className="h-7 w-7 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="h-7 w-7 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Live stats strip */}
                            {!isMinimized && clinicData?.stats && (
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/15">
                                    {[
                                        { label: 'اليوم', value: clinicData.stats.today_total ?? 0, icon: <Calendar className="h-3 w-3" /> },
                                        { label: 'المعلقة', value: (clinicData.appointments || []).filter(a => a.status === 'pending').length, icon: <Clock className="h-3 w-3" /> },
                                        { label: 'المكتملة', value: clinicData.stats.today_completed ?? 0, icon: <CheckCircle2 className="h-3 w-3" /> },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                                            <span className="text-white/60">{item.icon}</span>
                                            <span className="text-white font-black text-xs">{item.value}</span>
                                            <span className="text-white/60 text-[9px]">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ══ Body ════════════════════════════════════════════ */}
                        {!isMinimized && (
                            <>
                                {/* ── Category Tabs ───────────────────────────── */}
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

                                        {/* Category prompts */}
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

                                {/* ── Messages ────────────────────────────────── */}
                                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
                                    <AnimatePresence initial={false}>
                                        {messages.map(msg => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {/* Avatar */}
                                                {msg.role === 'assistant' && (
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mt-0.5 shadow-sm">
                                                        <Bot className="h-4 w-4 text-white" />
                                                    </div>
                                                )}

                                                <div className={`flex-1 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                                    {/* Bubble */}
                                                    <div className={`relative group max-w-[92%] ${
                                                        msg.role === 'user'
                                                            ? 'bg-blue-600 text-white rounded-2xl rounded-tl-sm px-4 py-2.5'
                                                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm'
                                                    }`}>
                                                        <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                                                            {renderContent(msg.content)}
                                                        </div>

                                                        {/* Action block */}
                                                        {msg.actionBlock && renderActionBlock(msg)}

                                                        {/* Quick replies */}
                                                        {msg.quickReplies && msg.quickReplies.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                                {msg.quickReplies.map((qr, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => sendMessage(qr)}
                                                                        disabled={isLoading}
                                                                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 active:scale-95 transition-all disabled:opacity-40"
                                                                    >
                                                                        {qr}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Copy button */}
                                                        {msg.role === 'assistant' && (
                                                            <button
                                                                onClick={() => handleCopy(msg.id, msg.content)}
                                                                className="absolute -top-2.5 -left-2.5 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-sm"
                                                            >
                                                                {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Timestamp */}
                                                    <p className={`text-[9px] mt-1 text-slate-400 ${msg.role === 'user' ? 'text-left' : ''}`}>
                                                        {msg.timestamp.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Loading bubbles */}
                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-4 w-4 text-white animate-pulse" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm flex items-center justify-center">
                                                <div className="flex gap-1.5 items-center">
                                                    {[0, 150, 300].map(delay => (
                                                        <span key={delay} className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* ── Input Bar ───────────────────────────────── */}
                                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-3 z-10 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-600 px-3 py-2 shadow-sm
                                        focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
                                        
                                        {/* Attachment / Actions button (Mockup for UX) */}
                                        <button
                                            type="button"
                                            className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all mb-0.5"
                                        >
                                            <PlusCircle className="h-5 w-5" />
                                        </button>

                                        <textarea
                                            ref={inputRef}
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="اطلب أي شيء للعيادة..."
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
                                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 active:scale-95' 
                                                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'}`}
                                        >
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 px-1">
                                        <button
                                            onClick={() => setShowCategories(p => !p)}
                                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-md"
                                        >
                                            <Zap className="h-3 w-3" />
                                            المهام السريعة
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
