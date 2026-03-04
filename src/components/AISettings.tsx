import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Save, Info, Key, Bot, Layout, MessageSquare, GraduationCap, Truck, Building2, Plus, Trash2, DollarSign, Tag, Briefcase } from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { whatsappApi } from '@/lib/api';

const IDENTITY_TEMPLATES = [
    {
        id: 'marketing',
        name: 'التسويق والبرمجيات',
        icon: Sparkles,
        description: 'موظف مبيعات ذكي يروج للخدمات التقنية والتسويقية.',
        text: 'أنت موظف مبيعات ذكي لشركة الخطيب، وظيفتك الإجابة على أسئلة العملاء بودية واحترافية. قدم خدمات البرمجة وتطوير المواقع والتطبيقات، وأعمال التسويق وإدارة الحملات. حاول دائماً تحويل المحادثة إلى طلب خدمة.'
    },
    {
        id: 'delivery',
        name: 'الشحن والتوصيل',
        icon: Truck,
        description: 'مركز دعم للعملاء حول أسعار الشحن والتتبع.',
        text: 'أنت موظف دعم لشركة شحن. أجب على استفسارات الأسعار، ومواعيد التوصيل، وحالات الشحنات. كن سريعاً ومختصراً وودوداً.'
    },
    {
        id: 'education',
        name: 'المدارس والتعليم',
        icon: GraduationCap,
        description: 'مساعد لشؤون الطلاب حول التسجيل والرسوم.',
        text: 'أنت مساعد إداري لمدرسة مميزة. أجب على أسئلة أولياء الأمور حول التسجيل، الرسوم المدرسية، والمناهج. أكد على الجودة والاهتمام بالطلاب.'
    },
    {
        id: 'realestate',
        name: 'العقارات والمقاولات',
        icon: Building2,
        description: 'وسيط عقاري يعرض العقارات ويحجز المعاينات.',
        text: 'أنت وسيط عقاري محترف. ساعد العملاء في العثور على العقار المناسب، قدم تفاصيل المساحات والأسعار، وشجعهم على حجز موعد للمعاينة.'
    }
];

export default function AISettings() {
    const [settings, setSettings] = useState({
        ai_enabled: '0',
        ai_api_key: '',
        ai_system_instruction: '',
        ai_voice_enabled: '0',
        ai_voice_language: 'ar-XA',
    });
    const [services, setServices] = useState<any[]>([]);
    const [newService, setNewService] = useState({ name: '', description: '', price: '', category: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addingService, setAddingService] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchServices();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await whatsappApi.getSettings();
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error fetching settings:', error);
            // toastWithSound.error('فشل تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const data = await whatsappApi.getServices();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await whatsappApi.updateSettings(settings);
            toastWithSound.success('تم حفظ الإعدادات بنجاح');
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toastWithSound.error(error.message || 'فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const applyTemplate = (text: string) => {
        setSettings(s => ({ ...s, ai_system_instruction: text }));
        toastWithSound.success('تم تطبيق قالب الهوية بنجاح');
    };

    const handleAddService = async () => {
        if (!newService.name) return toastWithSound.error('يرجى إدخال اسم الخدمة');
        setAddingService(true);
        try {
            await whatsappApi.addService(newService);
            toastWithSound.success('تم إضافة الخدمة بنجاح');
            setNewService({ name: '', description: '', price: '', category: '' });
            fetchServices();
        } catch (error) {
            toastWithSound.error('فشل في إضافة الخدمة');
        } finally {
            setAddingService(false);
        }
    };

    const handleDeleteService = async (id: number) => {
        try {
            await whatsappApi.deleteService(id);
            toastWithSound.success('تم حذف الخدمة');
            fetchServices();
        } catch (error) {
            toastWithSound.error('فشل حذف الخدمة');
        }
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">جاري تحميل الإعدادات والخدمات...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20" dir="rtl">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 flex-row-reverse">
                <div className="text-center sm:text-right w-full">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">هوية الموظف الذكي</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">خصص كيف يتحدث البوت مع عملائك ويعبر عن علامتك التجارية</p>
                </div>
                <div className="p-2 sm:p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-glow shrink-0">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
                {/* AISettings Side (8 cols) */}
                <div className="lg:col-span-8 space-y-4 sm:space-y-8">
                    {/* Bot Identity Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-border/10 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Bot className="h-5 w-5 text-primary" />
                                        تفعيل الذكاء الاصطناعي للهوية
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">اجعل البوت يتفاعل بذكاء بناءً على هوية عيادتك</CardDescription>
                                </div>
                                <Switch
                                    checked={settings.ai_enabled === '1'}
                                    onCheckedChange={(checked) => setSettings({ ...settings, ai_enabled: checked ? '1' : '0' })}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="grid gap-6">
                                {/* API Key Field REMOVED — Key is managed centrally via .env */}
                                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 flex items-start gap-3">
                                    <div className="p-1.5 rounded-md bg-green-500/10 text-green-500 mt-0.5">
                                        <Key className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">مفتاح API مفعل مركزياً</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">يعمل الذكاء الاصطناعي بمفتاح مدار من قبل النظام. لا تحتاج لأي إعداد إضافي هنا.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-sm font-semibold">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                        هوية الطبيب والرد التلقائي
                                    </Label>
                                    <Textarea
                                        placeholder="اكتب كيف تريد للبوت أن يتحدث مع مرضاك..."
                                        value={settings.ai_system_instruction}
                                        onChange={(e) => setSettings({ ...settings, ai_system_instruction: e.target.value })}
                                        rows={6}
                                        className="bg-background/50 border-border/50 resize-none text-base text-right"
                                    />
                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>نصيحة: كلما زادت التفاصيل في الهوية، زاد ذكاء البوت.</span>
                                        <span>{settings.ai_system_instruction.length} حرف</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="text-base font-semibold flex items-center gap-2">
                                                <Layout className="h-4 w-4 text-primary" />
                                                الردود الصوتية الذكية
                                            </Label>
                                            <p className="text-xs text-muted-foreground">تحويل الردود النصية إلى بصمات صوتية احترافية</p>
                                        </div>
                                        <Switch
                                            checked={settings.ai_voice_enabled === '1'}
                                            onCheckedChange={(checked) => setSettings({ ...settings, ai_voice_enabled: checked ? '1' : '0' })}
                                        />
                                    </div>

                                    {settings.ai_voice_enabled === '1' && (
                                        <div className="grid gap-3 mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in zoom-in-95">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-primary">لغة ولهجة الصوت</Label>
                                            <select
                                                className="flex h-11 w-full rounded-lg border border-border/50 bg-background/80 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                                value={settings.ai_voice_language}
                                                onChange={(e) => setSettings({ ...settings, ai_voice_language: e.target.value })}
                                            >
                                                <option value="ar-XA">العربية (الأردن/الخليج - رسمي)</option>
                                                <option value="ar-EG">العربية (مصرية)</option>
                                                <option value="en-US">الإنجليزية (أمريكية)</option>
                                                <option value="en-GB">الإنجليزية (بريطانية)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full h-12 gap-2 text-lg font-bold transition-all hover:scale-[1.01]"
                                    >
                                        {saving ? (
                                            <span className="animate-pulse">جاري الحفظ والبرمجة...</span>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                حفظ وبرمجة الهوية
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Smart Services Card [NEW] */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
                        <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between bg-muted/10">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    إدارة الخدمات والمنتجات الذكية
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">أضف خدماتك ليقوم البوت بتعلمها والرد على المرضى بخصوصها فوراً</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Add Service Form */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">اسم الخدمة/المنتج</Label>
                                    <Input
                                        placeholder="مثلاً: تنظيف أسنان"
                                        value={newService.name}
                                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-xs font-bold">وصف الخدمة (المميزات)</Label>
                                    <Input
                                        placeholder="وصف ما ستقدمه للمريض في هذه الخدمة..."
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">السعر</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="مثلاً: 50 دينار"
                                            value={newService.price}
                                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                                            className="bg-background border-border pr-8 text-left"
                                            dir="ltr"
                                        />
                                        <DollarSign className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="md:col-span-4 flex justify-end">
                                    <Button onClick={handleAddService} disabled={addingService} variant="secondary" size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        إضافة للقاموس الذكي
                                    </Button>
                                </div>
                            </div>

                            {/* Services List */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-primary" />
                                    الخدمات المضافة حالياً للمعرفة:
                                </h4>
                                {services.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
                                        لم تقم بإضافة أي خدمات بعد. أضف خدماتك ليتمكن البوت من فهمها.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {services.map(s => (
                                            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all group">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-primary">{s.name}</span>
                                                        {s.price && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{s.price}</span>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{s.description}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all"
                                                    onClick={() => handleDeleteService(s.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Templates Side (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-bold text-lg">قوالب الهوية الجاهزة</h3>
                    </div>

                    <div className="grid gap-3">
                        {IDENTITY_TEMPLATES.map((tmpl) => {
                            const Icon = tmpl.icon;
                            const isActive = settings.ai_system_instruction === tmpl.text;
                            return (
                                <Card
                                    key={tmpl.id}
                                    className={`group cursor-pointer border-border/50 transition-all hover:border-primary/50 hover:shadow-lg ${isActive ? 'ring-2 ring-primary border-transparent translate-x-[-4px]' : ''}`}
                                    onClick={() => applyTemplate(tmpl.text)}
                                >
                                    <div className="p-4 flex gap-4">
                                        <div className={`shrink-0 p-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-sm">{tmpl.name}</h4>
                                            <p className="text-[11px] text-muted-foreground leading-tight">{tmpl.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="border-border/50 bg-blue-500/5">
                        <CardContent className="p-5 space-y-3">
                            <h4 className="font-bold text-sm text-blue-500 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                نصيحة تجارية
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                اختر القالب الأقرب لنوع نشاطك، ثم قم بتعديل اسم العيادة وأرقام التواصل بداخل النص لضمان أفضل تجربة لمرضاك. الهوية المخصصة تزيد من ثقة المرضى بنسبة 70%.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
