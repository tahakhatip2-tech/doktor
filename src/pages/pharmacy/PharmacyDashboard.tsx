import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pill, CheckCircle2, Clock, Calendar, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PharmacyDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dispensingId, setDispensingId] = useState<number | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('pharmacy_token');
            const [statsRes, presRes] = await Promise.all([
                axios.get(`${API_URL}/pharmacy/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/pharmacy/prescriptions?status=PENDING`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setPrescriptions(presRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleDispense = async (id: number) => {
        try {
            setDispensingId(id);
            const token = localStorage.getItem('pharmacy_token');
            await axios.post(`${API_URL}/pharmacy/prescriptions/${id}/dispense`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: 'تم صرف الوصفة',
                description: 'تم صرف الوصفة بنجاح وتحديث حالتها.',
            });
            fetchDashboardData();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: error.response?.data?.message || 'حدث خطأ أثناء صرف الوصفة'
            });
        } finally {
            setDispensingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
                <p className="text-slate-500">جاري تحميل لوحة التحكم...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>

            {/* إحصائيات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* إجمالي الوصفات */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-emerald-50 font-medium text-sm">إجمالي الوصفات</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.totalPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Pill className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* قيد الانتظار */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-amber-50 font-medium text-sm">قيد الانتظار</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.pendingPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* مصروفة */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-blue-50 font-medium text-sm">مصروفة</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.dispensedPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* وصفات اليوم */}
                <Card className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-purple-600 opacity-95 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>
                    <CardContent className="relative p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <p className="text-fuchsia-50 font-medium text-sm">وصفات اليوم</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-white">{stats?.todayPrescriptions || 0}</h3>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* الوصفات الواردة */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">الوصفات الواردة مؤخراً</CardTitle>
                </CardHeader>
                <CardContent>
                    {prescriptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Pill className="h-12 w-12 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">لا توجد وصفات قيد الانتظار</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((p) => (
                                <div key={p.id} className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                                قيد الانتظار
                                            </Badge>
                                            <span className="text-xs text-slate-500">
                                                {format(new Date(p.createdAt), 'dd MMM yyyy - hh:mm a', { locale: ar })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-800">مريض: {p.patient?.name}</h3>
                                        <p className="text-sm text-slate-600">من العيادة: {p.doctor?.clinic_name || p.doctor?.name}</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-50"
                                            onClick={() => alert('تفاصيل الوصفة: سيتم عرض تفاصيل الأدوية هنا')}
                                        >
                                            التفاصيل
                                        </Button>
                                        <Button 
                                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                            disabled={dispensingId === p.id}
                                            onClick={() => handleDispense(p.id)}
                                        >
                                            {dispensingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'صرف الوصفة'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
