import { useState, useEffect } from "react";
import { dataApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, DollarSign } from "lucide-react";
import { toastWithSound } from "@/lib/toast-with-sound";
import { motion } from "framer-motion";

const AdminPlans = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        interval: 'month',
        features: ''
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await dataApi.get('/admin/plans');
            setPlans(data);
        } catch (error) {
            console.error('Error fetching plans:', error);
            toastWithSound.error('فشل في جلب الخطط');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await dataApi.patch(`/admin/plans/${editingPlan.id}`, {
                    ...formData,
                    price: parseFloat(formData.price)
                });
                toastWithSound.success('تم تحديث الخطة');
            } else {
                await dataApi.post('/admin/plans', {
                    ...formData,
                    price: parseFloat(formData.price)
                });
                toastWithSound.success('تم إنشاء الخطة');
            }
            setShowDialog(false);
            resetForm();
            fetchPlans();
        } catch (error) {
            toastWithSound.error('فشل في حفظ الخطة');
        }
    };

    const handleEdit = (plan: any) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            price: plan.price.toString(),
            interval: plan.interval,
            features: plan.features || ''
        });
        setShowDialog(true);
    };

    const handleDelete = async (planId: number) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;

        try {
            await dataApi.delete(`/admin/plans/${planId}`);
            toastWithSound.success('تم حذف الخطة');
            fetchPlans();
        } catch (error) {
            toastWithSound.error('فشل في حذف الخطة');
        }
    };

    const resetForm = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            interval: 'month',
            features: ''
        });
    };

    const openNewDialog = () => {
        resetForm();
        setShowDialog(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">إدارة الخطط والاشتراكات</h2>
                <Button onClick={openNewDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    خطة جديدة
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">جاري التحميل...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="border-orange-100 shadow-md hover:shadow-xl transition-all p-6 relative group">
                                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>

                                <div className="text-center mb-4">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-4xl font-black text-blue-600">{Number(plan.price).toFixed(0)}</span>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-600">د.أ</div>
                                            <div className="text-xs text-slate-400">
                                                {plan.interval === 'month' ? 'شهرياً' : 'سنوياً'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {plan.description && (
                                    <p className="text-sm text-slate-600 text-center mb-4">{plan.description}</p>
                                )}

                                {plan.features && (
                                    <div className="mb-4 space-y-2">
                                        {plan.features.split(',').map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                <span>{feature.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200">
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Users className="h-4 w-4" />
                                            <span className="text-sm font-bold">{plan._count?.users || 0}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">مشترك</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'تعديل الخطة' : 'خطة جديدة'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>اسم الخطة</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>الوصف</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>السعر (د.أ)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>المدة</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={formData.interval}
                                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                                >
                                    <option value="month">شهرياً</option>
                                    <option value="year">سنوياً</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>الميزات (مفصولة بفاصلة)</Label>
                            <Textarea
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="ميزة 1, ميزة 2, ميزة 3"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
                            <Button type="submit">{editingPlan ? 'تحديث' : 'إنشاء'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPlans;
