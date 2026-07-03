import { useState, useEffect } from "react";
import { dataApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toastWithSound } from "@/lib/toast-with-sound";
import { motion } from "framer-motion";

const AdminPayments = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchPayments();
    }, [statusFilter, currentPage]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            params.append('page', currentPage.toString());

            const data = await dataApi.get(`/admin/payments?${params.toString()}`);
            setPayments(data.payments);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toastWithSound.error('فشل في جلب المدفوعات');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId: number) => {
        try {
            await dataApi.patch(`/admin/payments/${paymentId}/approve`);
            toastWithSound.success('تم قبول الدفعة');
            fetchPayments();
        } catch (error) {
            toastWithSound.error('فشل في قبول الدفعة');
        }
    };

    const handleReject = async (paymentId: number) => {
        try {
            await dataApi.patch(`/admin/payments/${paymentId}/reject`);
            toastWithSound.success('تم رفض الدفعة');
            fetchPayments();
        } catch (error) {
            toastWithSound.error('فشل في رفض الدفعة');
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 border-orange-100 shadow-md">
                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="جميع الحالات" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">جميع الحالات</SelectItem>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchPayments}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            <Card className="border-orange-100 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="text-right py-4 px-4 font-bold">#</th>
                                <th className="text-right py-4 px-4 font-bold">المستخدم</th>
                                <th className="text-right py-4 px-4 font-bold">المبلغ</th>
                                <th className="text-right py-4 px-4 font-bold">الحالة</th>
                                <th className="text-right py-4 px-4 font-bold">التاريخ</th>
                                <th className="text-right py-4 px-4 font-bold">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12">جاري التحميل...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12">لا يوجد مدفوعات</td></tr>
                            ) : (
                                payments.map((payment) => (
                                    <motion.tr key={payment.id} className="border-b hover:bg-slate-50">
                                        <td className="py-4 px-4">{payment.id}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{payment.user?.clinic_name || payment.user?.name}</span>
                                                <span className="text-sm text-slate-500">{payment.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-black text-green-600">{Number(payment.amount).toFixed(2)} د.أ</td>
                                        <td className="py-4 px-4">
                                            <Badge className={payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                {payment.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4 text-sm">{new Date(payment.createdAt).toLocaleDateString('ar-JO')}</td>
                                        <td className="py-4 px-4">
                                            {payment.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleApprove(payment.id)}>
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleReject(payment.id)}>
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                        <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>السابق</Button>
                        <span>صفحة {currentPage} من {totalPages}</span>
                        <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>التالي</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminPayments;
