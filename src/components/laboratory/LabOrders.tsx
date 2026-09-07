import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dataApi, appointmentsApi } from '@/lib/api';
import { toastWithSound } from '@/lib/toast-with-sound';
import { Loader2, FlaskConical, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import LabResultEntry from './LabResultEntry';

export default function LabOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await dataApi.get('/appointments?type=lab_test');
            setOrders(Array.isArray(data) ? data : (data?.data || []));
        } catch (error) {
            console.error('Error loading lab orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            await appointmentsApi.update(id, { status: newStatus });
            toastWithSound.success('تم تحديث حالة الفحص');
            loadOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toastWithSound.error('حدث خطأ أثناء تحديث الحالة');
        }
    };

    if (selectedOrder) {
        return (
            <LabResultEntry 
                order={selectedOrder} 
                onBack={() => {
                    setSelectedOrder(null);
                    loadOrders();
                }} 
            />
        );
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <Card className="border-red-100 dark:border-red-900/50 shadow-sm">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30">
                <CardTitle className="text-red-800 dark:text-red-200 text-lg flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    طلبات الفحوصات المخبرية
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        لا توجد طلبات فحوصات حالياً
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">رقم الطلب</th>
                                    <th className="px-4 py-3 font-semibold">تاريخ الطلب</th>
                                    <th className="px-4 py-3 font-semibold">المريض</th>
                                    <th className="px-4 py-3 font-semibold">الفحوصات المطلوبة</th>
                                    <th className="px-4 py-3 font-semibold">الحالة</th>
                                    <th className="px-4 py-3 font-semibold text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">#{order.id}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {format(new Date(order.appointmentDate || order.appointment_date || new Date()), 'dd MMMM yyyy', { locale: ar })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900 dark:text-slate-100">
                                                {order.customerName || order.customer_name || 'غير محدد'}
                                            </div>
                                            <div className="text-xs text-slate-500">{order.customerPhone || order.customer_phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                                            {order.notes || 'فحوصات شاملة'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.status === 'completed' ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">مكتمل</Badge>
                                            ) : order.status === 'processing' ? (
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">قيد الفحص</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">بانتظار العينة</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {order.status === 'completed' ? (
                                                <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => setSelectedOrder(order)}>
                                                    عرض النتيجة
                                                </Button>
                                            ) : order.status === 'processing' ? (
                                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-sm" onClick={() => setSelectedOrder(order)}>
                                                    إدخال النتائج
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => updateStatus(order.id, 'processing')}>
                                                    استلام العينة
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
