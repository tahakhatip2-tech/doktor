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
    Users, Shield, Key
} from 'lucide-react';
import axios from 'axios';
import { toastWithSound } from '@/lib/toast-with-sound';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ClinicDoctor {
    id: number;
    name: string;
    role: string;
    specialty?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
    isActive: boolean;
    createdAt: string;
    username?: string;
    hasLogin: boolean;
}

const emptyForm = {
    name: '',
    role: 'doctor',
    specialty: '',
    phone: '',
    workingHours: '',
    hourlyRate: '',
    username: '',
    password: '',
};

export default function ClinicDoctors() {
    const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

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
        setShowForm(true);
    };

    const openEdit = (doc: ClinicDoctor) => {
        setEditId(doc.id);
        setForm({
            name: doc.name,
            role: doc.role || 'doctor',
            specialty: doc.specialty || '',
            phone: doc.phone || '',
            workingHours: doc.workingHours || '',
            hourlyRate: doc.hourlyRate ? String(doc.hourlyRate) : '',
            username: doc.username || '',
            password: '', // لا نعرض كلمة المرور القديمة
        });
        setShowForm(true);
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
            };
            if (!payload.password) delete payload.password; // عدم تحديث كلمة المرور إذا كانت فارغة في التعديل
            
            if (editId) {
                await axios.patch(`${API_URL}/clinic-doctors/${editId}`, payload, { headers: headers() });
                toastWithSound.success('تم تحديث بيانات الموظف');
            } else {
                await axios.post(`${API_URL}/clinic-doctors`, payload, { headers: headers() });
                toastWithSound.success('تم إضافة الموظف بنجاح');
            }
            setShowForm(false);
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

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'doctor': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">طبيب</Badge>;
            case 'nurse': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">ممرض/ة</Badge>;
            case 'secretary': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">سكرتارية</Badge>;
            default: return <Badge variant="outline">{role}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">إدارة طاقم العيادة</h1>
                        <p className="text-xs text-slate-500 font-medium">{doctors.length} موظف مسجل</p>
                    </div>
                </div>
                <Button
                    onClick={openAdd}
                    className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    إضافة موظف
                </Button>
            </div>

            {/* Form Panel */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Card className="border border-orange-200 rounded-2xl p-5 bg-orange-50/30 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-orange-500" />
                                    {editId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                                </h3>
                                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={() => setShowForm(false)}>
                                    <X className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-700 border-b pb-2">المعلومات الأساسية</h4>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">الاسم *</label>
                                        <Input
                                            placeholder="الاسم الكامل"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            className="rounded-xl border-slate-200 focus-visible:border-orange-400 focus-visible:ring-0"
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">المسمى الوظيفي</label>
                                        <Select value={form.role} onValueChange={(val) => setForm(f => ({ ...f, role: val }))}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-0">
                                                <SelectValue placeholder="اختر الوظيفة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="doctor">طبيب معالج</SelectItem>
                                                <SelectItem value="nurse">ممرض/ة</SelectItem>
                                                <SelectItem value="secretary">موظف استقبال / سكرتارية</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {form.role === 'doctor' && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600">التخصص / المهنة</label>
                                            <Input
                                                placeholder="مثال: طب أسنان، طب عام..."
                                                value={form.specialty}
                                                onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                                                className="rounded-xl border-slate-200 focus-visible:border-orange-400"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">رقم الهاتف</label>
                                        <Input
                                            placeholder="+962..."
                                            value={form.phone}
                                            dir="ltr"
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            className="rounded-xl border-slate-200 focus-visible:border-orange-400"
                                        />
                                    </div>
                                </div>

                                {/* Access Credentials */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-orange-500" />
                                        بيانات الدخول للنظام
                                    </h4>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">اسم المستخدم (للدخول)</label>
                                        <Input
                                            placeholder="username"
                                            dir="ltr"
                                            value={form.username}
                                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                            className="rounded-xl border-slate-200 focus-visible:border-orange-400"
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600">
                                            كلمة المرور
                                            {editId && <span className="text-[10px] text-slate-400 font-normal mr-2">(اتركها فارغة إذا لم ترد تغييرها)</span>}
                                        </label>
                                        <Input
                                            type="password"
                                            dir="ltr"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                            className="rounded-xl border-slate-200 focus-visible:border-orange-400"
                                        />
                                    </div>

                                    {form.role === 'doctor' && (
                                        <>
                                            <div className="space-y-1.5 pt-2">
                                                <label className="text-xs font-bold text-slate-600">أجرة الساعة (دينار) - اختياري</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={form.hourlyRate}
                                                    onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                                                    className="rounded-xl border-slate-200 focus-visible:border-orange-400"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-orange-100">
                                <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl font-bold">إلغاء</Button>
                                <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
                                    {saving ? 'جاري الحفظ...' : <><Check className="h-4 w-4" /> حفظ الموظف</>}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Doctors Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-32 rounded-2xl animate-pulse bg-slate-50 border-slate-100" />
                    ))}
                </div>
            ) : doctors.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-bold">لا يوجد طاقم مضاف في العيادة حالياً</p>
                    <p className="text-xs text-slate-400 mt-1">قم بإضافة موظفين (أطباء، ممرضين، سكرتاريا) لإدارة صلاحياتهم</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map(doc => (
                        <Card key={doc.id} className={`p-4 rounded-2xl border transition-all ${doc.isActive ? 'border-slate-200 hover:border-orange-300 hover:shadow-md' : 'border-slate-100 bg-slate-50/50 opacity-75'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${doc.isActive ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {doc.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm leading-tight">{doc.name}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            {getRoleBadge(doc.role)}
                                            {doc.specialty && doc.role === 'doctor' && (
                                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{doc.specialty}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggle(doc)}
                                    className={`h-8 w-8 rounded-full ${doc.isActive ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600' : 'text-slate-400 hover:bg-slate-100'}`}
                                    title={doc.isActive ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                                >
                                    {doc.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="space-y-2 mb-4 mt-4 text-xs font-medium">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    <span dir="ltr">{doc.phone || 'غير محدد'}</span>
                                </div>
                                
                                {doc.hasLogin ? (
                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                        <Key className="h-3.5 w-3.5" />
                                        <span>لديه بيانات دخول</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-rose-500 bg-rose-50 w-fit px-2 py-1 rounded-md">
                                        <Shield className="h-3.5 w-3.5" />
                                        <span>لا يوجد بيانات دخول</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                    onClick={() => handleDelete(doc.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    حذف
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg"
                                    onClick={() => openEdit(doc)}
                                >
                                    <Pencil className="h-3.5 w-3.5 ml-1.5" />
                                    تعديل
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
