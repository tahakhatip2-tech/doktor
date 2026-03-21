import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    UserPlus, Stethoscope, Phone, Clock, DollarSign,
    Pencil, Trash2, X, Check, Plus, Power, PowerOff,
    ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { toastWithSound } from '@/lib/toast-with-sound';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ClinicDoctor {
    id: number;
    name: string;
    specialty?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
    isActive: boolean;
    createdAt: string;
}

const emptyForm = {
    name: '',
    specialty: '',
    phone: '',
    workingHours: '',
    hourlyRate: '',
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
            toastWithSound.error('حدث خطأ أثناء تحميل الأطباء');
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
            specialty: doc.specialty || '',
            phone: doc.phone || '',
            workingHours: doc.workingHours || '',
            hourlyRate: doc.hourlyRate ? String(doc.hourlyRate) : '',
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toastWithSound.error('يرجى إدخال اسم الطبيب');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
            };
            if (editId) {
                await axios.patch(`${API_URL}/clinic-doctors/${editId}`, payload, { headers: headers() });
                toastWithSound.success('تم تحديث بيانات الطبيب');
            } else {
                await axios.post(`${API_URL}/clinic-doctors`, payload, { headers: headers() });
                toastWithSound.success('تم إضافة الطبيب بنجاح');
            }
            setShowForm(false);
            fetchDoctors();
        } catch {
            toastWithSound.error('حدث خطأ، يرجى المحاولة مجدداً');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (doc: ClinicDoctor) => {
        try {
            await axios.patch(`${API_URL}/clinic-doctors/${doc.id}`, { isActive: !doc.isActive }, { headers: headers() });
            setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d));
            toastWithSound.success(doc.isActive ? 'تم إيقاف الطبيب' : 'تم تفعيل الطبيب');
        } catch {
            toastWithSound.error('حدث خطأ');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
        try {
            await axios.delete(`${API_URL}/clinic-doctors/${id}`, { headers: headers() });
            setDoctors(prev => prev.filter(d => d.id !== id));
            toastWithSound.success('تم حذف الطبيب');
        } catch {
            toastWithSound.error('حدث خطأ أثناء الحذف');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                        <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-blue-950 tracking-tight">أطباء العيادة</h1>
                        <p className="text-xs text-slate-500 font-medium">{doctors.length} طبيب مسجل</p>
                    </div>
                </div>
                <Button
                    onClick={openAdd}
                    className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    إضافة طبيب
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
                                <h3 className="font-black text-blue-950 text-base flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-orange-500" />
                                    {editId ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
                                </h3>
                                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={() => setShowForm(false)}>
                                    <X className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-blue-900">اسم الطبيب *</label>
                                    <Input
                                        placeholder="د. محمد أحمد"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="rounded-xl border-blue-100 focus-visible:border-orange-400 focus-visible:ring-0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-blue-900">التخصص</label>
                                    <Input
                                        placeholder="طب عام، أسنان، عظام..."
                                        value={form.specialty}
                                        onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                                        className="rounded-xl border-blue-100 focus-visible:border-orange-400 focus-visible:ring-0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-blue-900">رقم الهاتف</label>
                                    <Input
                                        placeholder="+962..."
                                        value={form.phone}
                                        dir="ltr"
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="rounded-xl border-blue-100 focus-visible:border-orange-400 focus-visible:ring-0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-blue-900">أجرة الساعة (دينار)</label>
                                    <Input
                                        type="number"
                                        placeholder="20"
                                        value={form.hourlyRate}
                                        onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                                        className="rounded-xl border-blue-100 focus-visible:border-orange-400 focus-visible:ring-0"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-blue-900">أوقات الدوام</label>
                                    <Input
                                        placeholder="السبت - الخميس: 9 ص - 5 م"
                                        value={form.workingHours}
                                        onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))}
                                        className="rounded-xl border-blue-100 focus-visible:border-orange-400 focus-visible:ring-0"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex-1"
                                >
                                    <Check className="h-4 w-4" />
                                    {saving ? 'جار الحفظ...' : 'حفظ'}
                                </Button>
                                <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                                    إلغاء
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Doctors List */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : doctors.length === 0 ? (
                <Card className="border border-blue-100 rounded-2xl p-12 text-center shadow-sm">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                        <Stethoscope className="h-8 w-8 text-blue-300" />
                    </div>
                    <h3 className="font-bold text-slate-700 mb-1">لا يوجد أطباء بعد</h3>
                    <p className="text-sm text-slate-400 mb-4">ابدأ بإضافة أول طبيب في عيادتك</p>
                    <Button onClick={openAdd} className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold">
                        <Plus className="h-4 w-4" /> إضافة طبيب
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {doctors.map((doc, i) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className={`relative rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group p-4 flex flex-col gap-3
                                    ${doc.isActive ? 'border-blue-100 hover:border-orange-400' : 'border-slate-100 opacity-60'}`}>

                                    {/* Active indicator */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${doc.isActive ? 'bg-gradient-to-r from-blue-500 to-orange-400' : 'bg-slate-200'}`} />

                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2 pt-1">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 font-black text-lg text-white shadow-sm
                                                ${doc.isActive ? 'bg-gradient-to-br from-blue-600 to-blue-500' : 'bg-slate-400'}`}>
                                                {doc.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-extrabold text-sm text-blue-950 truncate">{doc.name}</h3>
                                                {doc.specialty && (
                                                    <span className="text-[10px] font-bold text-orange-500">{doc.specialty}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={`text-[9px] shrink-0 rounded-lg px-2 ${doc.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                            {doc.isActive ? 'نشط' : 'موقوف'}
                                        </Badge>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-1.5">
                                        {doc.phone && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
                                                <Phone className="h-3 w-3 text-blue-400 shrink-0" />
                                                <span dir="ltr">{doc.phone}</span>
                                            </div>
                                        )}
                                        {doc.workingHours && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
                                                <Clock className="h-3 w-3 text-orange-400 shrink-0" />
                                                <span>{doc.workingHours}</span>
                                            </div>
                                        )}
                                        {doc.hourlyRate && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
                                                <DollarSign className="h-3 w-3 text-green-500 shrink-0" />
                                                <span>{Number(doc.hourlyRate).toFixed(2)} د.أ / ساعة</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 rounded-xl h-8 text-[11px] font-bold text-blue-600 border-blue-100 hover:bg-blue-50 gap-1"
                                            onClick={() => openEdit(doc)}
                                        >
                                            <Pencil className="h-3 w-3" /> تعديل
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`rounded-xl h-8 text-[11px] font-bold gap-1 ${doc.isActive ? 'text-slate-500 border-slate-100 hover:bg-slate-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                                            onClick={() => handleToggle(doc)}
                                        >
                                            {doc.isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl h-8 text-[11px] font-bold text-red-500 border-red-100 hover:bg-red-50 gap-1"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
