import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    UserPlus, Stethoscope, Phone, Clock, DollarSign,
    Pencil, Trash2, X, Check, Plus, Power, PowerOff,
    Users, Shield, Key, ArrowRight, Eye, EyeOff,
    Mail, Briefcase, BadgeCheck, Lock
} from 'lucide-react';
import axios from 'axios';
import { toastWithSound } from '@/lib/toast-with-sound';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ClinicDoctor {
    id: number;
    name: string;
    role: string;
    specialty?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    hourlyRate?: number;
    isActive: boolean;
    createdAt: string;
    username?: string;
    hasLogin: boolean;
    avatar?: string;
    workingDays?: string;
    shiftTiming?: string;
    certifications?: string;
    experienceYears?: number;
}

const emptyForm = {
    name: '',
    role: 'doctor',
    specialty: '',
    phone: '',
    email: '',
    workingHours: '',
    hourlyRate: '',
    username: '',
    password: '',
    avatar: '',
    workingDays: '',
    shiftTiming: 'morning',
    certifications: '',
    experienceYears: '',
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    doctor:    { label: 'طبيب معالج',           color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: '🩺' },
    nurse:     { label: 'ممرض/ة',                color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200', icon: '💉' },
    secretary: { label: 'استقبال / سكرتارية',   color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200',  icon: '🗂️' },
};

export default function ClinicDoctors() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('clinic-settings');

    const headers = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    });

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/clinic-doctors`, { headers: headers() });
            setDoctors(res.data);
        } catch {
            toastWithSound.error('حدث خطأ أثناء تحميل موظفي العيادة');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const openAdd = () => {
        setEditId(null);
        setForm(emptyForm);
        setShowModal(true);
        setShowPassword(false);
    };

    const openEdit = (doc: ClinicDoctor) => {
        setEditId(doc.id);
        setForm({
            name: doc.name,
            role: doc.role || 'doctor',
            specialty: doc.specialty || '',
            phone: doc.phone || '',
            email: doc.email || '',
            workingHours: doc.workingHours || '',
            hourlyRate: doc.hourlyRate ? String(doc.hourlyRate) : '',
            username: doc.username || '',
            password: '',
            avatar: doc.avatar || '',
            workingDays: doc.workingDays || '',
            shiftTiming: doc.shiftTiming || 'morning',
            certifications: doc.certifications || '',
            experienceYears: doc.experienceYears ? String(doc.experienceYears) : '',
        });
        setShowModal(true);
        setShowPassword(false);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toastWithSound.error('يرجى إدخال اسم الموظف');
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                ...form,
                hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
                experienceYears: form.experienceYears ? parseInt(form.experienceYears, 10) : undefined,
            };
            if (!payload.password) delete payload.password;

            if (editId) {
                await axios.patch(`${API_URL}/clinic-doctors/${editId}`, payload, { headers: headers() });
                toastWithSound.success('تم تحديث بيانات الموظف');
            } else {
                await axios.post(`${API_URL}/clinic-doctors`, payload, { headers: headers() });
                toastWithSound.success('تم إضافة الموظف بنجاح');
            }
            setShowModal(false);
            fetchDoctors();
        } catch (error: any) {
            toastWithSound.error(error.response?.data?.message || 'حدث خطأ، يرجى المحاولة مجدداً');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (doc: ClinicDoctor) => {
        try {
            await axios.patch(`${API_URL}/clinic-doctors/${doc.id}`, { isActive: !doc.isActive }, { headers: headers() });
            setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d));
            toastWithSound.success(doc.isActive ? 'تم إيقاف حساب الموظف' : 'تم تفعيل حساب الموظف');
        } catch {
            toastWithSound.error('حدث خطأ');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        try {
            await axios.delete(`${API_URL}/clinic-doctors/${id}`, { headers: headers() });
            setDoctors(prev => prev.filter(d => d.id !== id));
            toastWithSound.success('تم حذف الموظف');
        } catch {
            toastWithSound.error('حدث خطأ أثناء الحذف');
        }
    };

    const getRoleInfo = (role: string) => ROLE_CONFIG[role] || ROLE_CONFIG['doctor'];

    const activeCount  = doctors.filter(d => d.isActive).length;
    const loginCount   = doctors.filter(d => d.hasLogin).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950" dir="rtl">
            {/* ── Header ── */}
            <Header
                activeTab={activeTab}
                onTabChange={(tab) => { setActiveTab(tab); navigate('/'); }}
                onNavigate={(path) => navigate(path)}
            />

            {/* ── Hero Banner ── */}
            <HeroSection
                doctorName={user?.name ? (user.name.includes('د.') || user.name.startsWith('د ') ? user.name : `د. ${user.name}`) : 'دكتور'}
                pageTitle="إدارة طاقم العيادة"
                description="أضف أطبائك، ممرضينك، وطاقم الاستقبال وامنحهم صلاحيات الدخول"
                icon={Users}
            >
                <div className="flex items-center gap-2 w-full justify-center md:justify-end">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all shadow-lg backdrop-blur-md border border-white/10 group"
                        title="عودة للرئيسية"
                    >
                        <ArrowRight className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <Button
                        onClick={openAdd}
                        className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-black shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400/50 px-6 py-2.5 h-auto text-sm transition-all hover:scale-105"
                    >
                        <Plus className="h-5 w-5" />
                        إضافة موظف جديد
                    </Button>
                </div>
            </HeroSection>

            {/* ── Stats Bar ── */}
            <div className="max-w-5xl mx-auto -mt-5 px-4 mb-6">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'إجمالي الموظفين', value: doctors.length, color: 'text-slate-700', bg: 'bg-white', icon: '👥' },
                        { label: 'نشطون حالياً',    value: activeCount,    color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
                        { label: 'لديهم دخول',       value: loginCount,     color: 'text-blue-600', bg: 'bg-blue-50', icon: '🔑' },
                    ].map(stat => (
                        <div key={stat.label} className={`${stat.bg} rounded-2xl shadow-sm border border-white/80 p-3 text-center`}>
                            <div className="text-xl mb-0.5">{stat.icon}</div>
                            <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                            <div className="text-[10px] text-slate-500 font-bold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-4 pb-28">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-44 rounded-3xl animate-pulse bg-slate-100 border border-slate-200" />
                        ))}
                    </div>
                ) : doctors.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white"
                    >
                        <div className="text-6xl mb-4">👨‍⚕️</div>
                        <p className="text-slate-600 font-black text-lg mb-2">لا يوجد طاقم مضاف بعد</p>
                        <p className="text-slate-400 text-sm mb-6">أضف أطباءك وموظفيك ليتمكنوا من الدخول للنظام</p>
                        <Button
                            onClick={openAdd}
                            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            إضافة أول موظف
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {doctors.map((doc, idx) => {
                                const roleInfo = getRoleInfo(doc.role);
                                return (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className={`p-5 rounded-3xl border-2 transition-all hover:shadow-lg ${doc.isActive ? 'border-slate-200 hover:border-orange-200 bg-white' : 'border-slate-100 bg-slate-50/80 opacity-60'}`}>
                                            {/* Top Row */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border ${roleInfo.bg} ${roleInfo.border}`}>
                                                        {roleInfo.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-800 text-sm leading-tight">{doc.name}</h3>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${roleInfo.color} ${roleInfo.bg} ${roleInfo.border}`}>
                                                                {roleInfo.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleToggle(doc)}
                                                    className={`p-2 rounded-xl transition-all ${doc.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                    title={doc.isActive ? 'إيقاف' : 'تفعيل'}
                                                >
                                                    {doc.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                                </button>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-1.5 mb-4">
                                                {doc.specialty && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="font-medium">{doc.specialty}</span>
                                                    </div>
                                                )}
                                                {doc.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        <span dir="ltr" className="font-medium">{doc.phone}</span>
                                                    </div>
                                                )}
                                                {doc.username && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Key className="h-3.5 w-3.5 text-slate-400" />
                                                        <span dir="ltr" className="font-mono font-bold">{doc.username}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Login badge */}
                                            <div className="mb-4">
                                                {doc.hasLogin ? (
                                                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                                                        <BadgeCheck className="h-3.5 w-3.5" />
                                                        يمكنه الدخول للنظام
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                                                        <Shield className="h-3.5 w-3.5" />
                                                        لا يوجد بيانات دخول
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="flex-1 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-9"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 ml-1" />
                                                    حذف
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => openEdit(doc)}
                                                    className="flex-1 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9 shadow-sm"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 ml-1" />
                                                    تعديل
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* ══════════ MODAL ══════════ */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 60, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.96 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
                            dir="rtl"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-l from-orange-500 to-orange-600 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-white/20">
                                        <UserPlus className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-black text-base">
                                            {editId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                                        </h2>
                                        <p className="text-orange-100 text-xs mt-0.5">
                                            {editId ? 'عدّل المعلومات ثم اضغط حفظ' : 'أدخل معلومات الموظف وصلاحياته'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">

                                {/* ── Section 1: Basic Info ── */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        المعلومات الأساسية
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 mb-1 block">الاسم الكامل *</label>
                                            <Input
                                                placeholder="مثال: د. أحمد محمد"
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-600 mb-1 block">المسمى الوظيفي</label>
                                            <Select value={form.role} onValueChange={(val) => setForm(f => ({ ...f, role: val }))}>
                                                <SelectTrigger className="rounded-2xl border-slate-200 focus:ring-0 h-11">
                                                    <SelectValue placeholder="اختر الوظيفة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="doctor">🩺 طبيب معالج</SelectItem>
                                                    <SelectItem value="nurse">💉 ممرض/ة</SelectItem>
                                                    <SelectItem value="secretary">🗂️ موظف استقبال / سكرتارية</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {form.role === 'doctor' && (
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-1 block">التخصص الطبي</label>
                                                <Input
                                                    placeholder="مثال: طب أسنان، طب عام، أطفال..."
                                                    value={form.specialty}
                                                    onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                                                    className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11"
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-1 block">
                                                    <Phone className="h-3 w-3 inline ml-1" />
                                                    رقم الهاتف
                                                </label>
                                                <Input
                                                    placeholder="+962..."
                                                    value={form.phone}
                                                    dir="ltr"
                                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                                    className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-1 block">
                                                    <Mail className="h-3 w-3 inline ml-1" />
                                                    البريد الإلكتروني
                                                </label>
                                                <Input
                                                    placeholder="email@..."
                                                    value={form.email}
                                                    dir="ltr"
                                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                    className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                />
                                            </div>
                                        </div>

                                        {form.role === 'doctor' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-600 mb-1 block">
                                                        <Clock className="h-3 w-3 inline ml-1" />
                                                        ساعات العمل
                                                    </label>
                                                    <Input
                                                        placeholder="مثال: 9ص - 5م"
                                                        value={form.workingHours}
                                                        onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))}
                                                        className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-600 mb-1 block">
                                                        <DollarSign className="h-3 w-3 inline ml-1" />
                                                        أجر الكشف (دينار)
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0.00"
                                                        value={form.hourlyRate}
                                                        onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                                                        className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-3 mt-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-2 block">الصورة الشخصية</label>
                                                <div className="flex items-center gap-3">
                                                    {form.avatar && (
                                                        <div className="h-11 w-11 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-50">
                                                            <img src={form.avatar} alt="Preview" className="h-full w-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setForm(f => ({ ...f, avatar: reader.result as string }));
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="rounded-xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer pt-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-1 block">أيام العمل</label>
                                                <Input
                                                    placeholder="مثال: الأحد، الثلاثاء، الخميس"
                                                    value={form.workingDays}
                                                    onChange={e => setForm(f => ({ ...f, workingDays: e.target.value }))}
                                                    className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-1 block">فترة الدوام</label>
                                                <Select value={form.shiftTiming} onValueChange={(val) => setForm(f => ({ ...f, shiftTiming: val }))}>
                                                    <SelectTrigger className="rounded-2xl border-slate-200 focus:ring-0 h-11 text-sm">
                                                        <SelectValue placeholder="اختر الفترة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="morning">صباحي</SelectItem>
                                                        <SelectItem value="evening">مسائي</SelectItem>
                                                        <SelectItem value="full">فترتين</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {form.role === 'doctor' && (
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-600 mb-1 block">سنوات الخبرة</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="مثال: 10"
                                                        value={form.experienceYears}
                                                        onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))}
                                                        className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="text-xs font-bold text-slate-600 mb-1 block">الشهادات والمؤهلات</label>
                                                    <Input
                                                        placeholder="مثال: بورد أمريكي، زمالة..."
                                                        value={form.certifications}
                                                        onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))}
                                                        className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <Lock className="h-3 w-3" />
                                        بيانات دخول النظام
                                    </div>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>

                                {/* ── Section 2: Login Credentials ── */}
                                <div>
                                    <p className="text-[11px] text-slate-500 mb-3 bg-blue-50 border border-blue-100 rounded-xl p-3 leading-relaxed">
                                        💡 بيانات الدخول تتيح للموظف الدخول لنظام العيادة عبر شاشة تسجيل الدخول الخاصة به. إذا تركتها فارغة لن يتمكن من تسجيل الدخول.
                                    </p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-600 mb-1 block">
                                                <Key className="h-3 w-3 inline ml-1" />
                                                اسم المستخدم (للدخول)
                                            </label>
                                            <Input
                                                placeholder="username (بالإنجليزية)"
                                                dir="ltr"
                                                value={form.username}
                                                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                                className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center justify-between">
                                                <span>
                                                    <Shield className="h-3 w-3 inline ml-1" />
                                                    كلمة المرور
                                                </span>
                                                {editId && (
                                                    <span className="text-[10px] text-slate-400 font-normal">اتركها فارغة إن لم تردْ تغييرها</span>
                                                )}
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    dir="ltr"
                                                    placeholder="••••••••"
                                                    value={form.password}
                                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                    className="rounded-2xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0 h-11 pl-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-2xl font-bold h-11 hover:bg-slate-200"
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black h-11 gap-2 shadow-lg shadow-orange-200"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            جاري الحفظ...
                                        </span>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            {editId ? 'حفظ التعديلات' : 'إضافة الموظف'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Bottom Nav ── */}
            <BottomNav activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); navigate('/'); }} />
        </div>
    );
}
