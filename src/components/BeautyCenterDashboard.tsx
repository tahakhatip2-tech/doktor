import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toastWithSound } from '@/lib/toast-with-sound';
import { BASE_URL } from '@/lib/api';
import { Plus, Trash2, Edit, Sparkles, Clock, CircleDollarSign, Loader2, Save, X } from 'lucide-react';
import axios from 'axios';

interface BeautyService {
    id: number;
    name: string;
    description: string | null;
    duration: number | null;
    price: string | null;
    icon: string | null;
    isActive: boolean;
}

export default function BeautyCenterDashboard() {
    const [services, setServices] = useState<BeautyService[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/beauty-services`, { headers: getHeaders() });
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching beauty services:', error);
            toastWithSound.error('فشل في جلب الخدمات');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setDuration('');
        setPrice('');
        setIsActive(true);
        setShowForm(false);
    };

    const handleEdit = (service: BeautyService) => {
        setEditingId(service.id);
        setName(service.name);
        setDescription(service.description || '');
        setDuration(service.duration ? String(service.duration) : '');
        setPrice(service.price || '');
        setIsActive(service.isActive);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toastWithSound.error('الرجاء إدخال اسم الخدمة');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                duration: duration ? parseInt(duration) : null,
                price: price.trim() || null,
                isActive
            };

            if (editingId) {
                await axios.patch(`${BASE_URL}/api/beauty-services/${editingId}`, payload, { headers: getHeaders() });
                toastWithSound.success('تم تحديث الخدمة بنجاح');
            } else {
                await axios.post(`${BASE_URL}/api/beauty-services`, payload, { headers: getHeaders() });
                toastWithSound.success('تمت إضافة الخدمة بنجاح');
            }
            
            resetForm();
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
            toastWithSound.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
        
        try {
            await axios.delete(`${BASE_URL}/api/beauty-services/${id}`, { headers: getHeaders() });
            toastWithSound.success('تم حذف الخدمة');
            setServices(services.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting service:', error);
            toastWithSound.error('حدث خطأ أثناء الحذف');
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await axios.patch(`${BASE_URL}/api/beauty-services/${id}`, { isActive: !currentStatus }, { headers: getHeaders() });
            setServices(services.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
            toastWithSound.success('تم تحديث حالة الخدمة');
        } catch (error) {
            console.error('Error toggling status:', error);
            toastWithSound.error('حدث خطأ أثناء التحديث');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-pink-900 tracking-tighter flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-pink-500" />
                        إدارة خدمات التجميل والعناية
                    </h2>
                    <p className="text-sm text-pink-700/80 font-medium mt-1">
                        أضف وقم بإدارة الخدمات والجلسات التي يقدمها المركز
                    </p>
                </div>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="bg-pink-600 hover:bg-pink-700 text-white gap-2 shadow-lg shadow-pink-600/20">
                        <Plus className="h-4 w-4" />
                        إضافة خدمة جديدة
                    </Button>
                )}
            </div>

            {showForm && (
                <Card className="p-6 border-pink-100 shadow-xl shadow-pink-100/50 bg-white/80 backdrop-blur-xl animate-scale-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">
                            {editingId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>اسم الخدمة <span className="text-red-500">*</span></Label>
                                <Input 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="مثال: ليزر إزالة الشعر (جلسة كاملة)" 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>السعر</Label>
                                <Input 
                                    value={price} 
                                    onChange={e => setPrice(e.target.value)} 
                                    placeholder="مثال: 50 دينار أو 'تبدأ من 20 دينار'" 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>الوصف</Label>
                                <Textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    placeholder="وصف تفصيلي للخدمة ومميزاتها..." 
                                    className="bg-white resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>مدة الجلسة (بالدقائق)</Label>
                                <Input 
                                    type="number"
                                    value={duration} 
                                    onChange={e => setDuration(e.target.value)} 
                                    placeholder="مثال: 45" 
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-2 flex items-center gap-3 pt-6">
                                <Switch 
                                    checked={isActive} 
                                    onCheckedChange={setIsActive} 
                                    id="is-active"
                                />
                                <Label htmlFor="is-active" className="cursor-pointer">الخدمة متاحة (نشطة)</Label>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={resetForm} disabled={saving}>
                                إلغاء
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700 text-white gap-2">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                حفظ الخدمة
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-pink-200">
                    <Sparkles className="h-12 w-12 mx-auto text-pink-200 mb-3" />
                    <h3 className="text-lg font-bold text-slate-700">لا يوجد خدمات مضافة</h3>
                    <p className="text-sm text-slate-500 mt-1">قم بإضافة خدمات مركزك لتظهر للمرضى</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map(service => (
                        <Card key={service.id} className={`p-5 transition-all hover:shadow-md border-l-4 ${service.isActive ? 'border-l-pink-500' : 'border-l-slate-300 opacity-70'} relative overflow-hidden group`}>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-slate-800 pr-4">{service.name}</h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-3 top-3">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleEdit(service)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(service.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            {service.description && (
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-4">
                                {service.duration && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                        <Clock className="h-3.5 w-3.5" />
                                        {service.duration} دقيقة
                                    </div>
                                )}
                                {service.price && (
                                    <div className="flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md">
                                        <CircleDollarSign className="h-3.5 w-3.5" />
                                        {service.price}
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                                <span className="text-xs font-medium text-slate-500">
                                    الحالة: {service.isActive ? <span className="text-green-600">نشط</span> : <span className="text-slate-400">غير نشط</span>}
                                </span>
                                <Switch 
                                    checked={service.isActive} 
                                    onCheckedChange={() => handleToggleStatus(service.id, service.isActive)} 
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
