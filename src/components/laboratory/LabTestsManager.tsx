import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2, Save, X, FlaskConical } from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';import { apiFetch } from '@/lib/api';

export default function LabTestsManager() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/laboratory/tests');
            setTests(data || []);
        } catch (error) {
            toastWithSound.error('حدث خطأ أثناء جلب الفحوصات');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        setDescription('');
        setShowForm(false);
    };

    const handleEdit = (test: any) => {
        setEditingId(test.id);
        setName(test.name);
        setPrice(test.price || '');
        setDescription(test.description || '');
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا الفحص؟')) {
            try {
                await apiFetch(`/laboratory/tests/${id}`, { method: 'DELETE' });
                setTests(tests.filter(t => t.id !== id));
                toastWithSound.success('تم حذف الفحص بنجاح');
            } catch (error) {
                toastWithSound.error('حدث خطأ أثناء الحذف');
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toastWithSound.error('الرجاء إدخال اسم الفحص');
            return;
        }

        try {
            if (editingId) {
                const updated = await apiFetch(`/laboratory/tests/${editingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ name, price, description })
                });
                setTests(tests.map(t => t.id === editingId ? updated : t));
                toastWithSound.success('تم تحديث الفحص بنجاح');
            } else {
                const created = await apiFetch('/laboratory/tests', {
                    method: 'POST',
                    body: JSON.stringify({ name, price, description, category: 'laboratory', isActive: true })
                });
                setTests([created, ...tests]);
                toastWithSound.success('تمت إضافة الفحص بنجاح');
            }
            resetForm();
        } catch (error) {
            toastWithSound.error('حدث خطأ أثناء الحفظ');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (showForm) {
        return (
            <Card className="border-purple-100 dark:border-purple-900/50">
                <CardHeader>
                    <CardTitle className="text-purple-800 dark:text-purple-200">
                        {editingId ? 'تعديل فحص' : 'إضافة فحص جديد'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>اسم الفحص</Label>
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="مثال: Vitamin D" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>السعر (د.أ)</Label>
                        <Input 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)} 
                            placeholder="مثال: 30" 
                            type="number"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>الوصف / شروط الفحص</Label>
                        <Textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="مثال: يتطلب صيام 8 ساعات..." 
                        />
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={resetForm}>
                            <X className="h-4 w-4 ml-2" /> إلغاء
                        </Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSave}>
                            <Save className="h-4 w-4 ml-2" /> حفظ الفحص
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-purple-100 dark:border-purple-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    قائمة الفحوصات المتاحة
                </CardTitle>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 ml-2" /> إضافة فحص
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tests.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-slate-500">
                            لا يوجد فحوصات مضافة بعد.
                        </div>
                    ) : (
                        tests.map((test) => (
                            <div key={test.id} className="border border-purple-100 dark:border-purple-900/50 rounded-xl p-4 bg-purple-50/30 dark:bg-purple-900/10 flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{test.name}</h3>
                                        {test.price && <span className="font-black text-purple-600 dark:text-purple-400">{test.price} د.أ</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">{test.description || 'لا يوجد وصف'}</p>
                                </div>
                                
                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(test)} className="h-8">
                                        <Edit className="h-3 w-3 ml-1" /> تعديل
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(test.id)} className="h-8 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                                        <Trash2 className="h-3 w-3 ml-1" /> حذف
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
