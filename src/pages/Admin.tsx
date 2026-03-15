import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserX, UserCheck, Calendar, Shield } from "lucide-react";
import { toastWithSound } from '@/lib/toast-with-sound';
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Admin = () => {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                navigate("/");
                return;
            }
            fetchUsers();
        }
    }, [user, authLoading]);

    const fetchUsers = async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (err: any) {
            toastWithSound.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: number, newStatus: string) => {
        try {
            await adminApi.updateUser(userId, { status: newStatus });
            toastWithSound.success("تم طھحدظٹث حالة المسطھخدم");
            fetchUsers();
        } catch (err: any) {
            toastWithSound.error(err.message);
        }
    };

    const handleExtendExpiry = async (userId: number, currentExpiry: string) => {
        const newDate = new Date(currentExpiry || new Date());
        newDate.setMonth(newDate.getMonth() + 1);

        try {
            await adminApi.updateUser(userId, { expiry_date: newDate.toISOString() });
            toastWithSound.success("تم تمدظٹد العضظˆظٹة لمدة شهر");
            fetchUsers();
        } catch (err: any) {
            toastWithSound.error(err.message);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden" dir="rtl">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 resize-bg-animation"
                style={{ backgroundImage: 'url(/doktor-jo-auth-v2.png)' }}
            >
                {/* Overlay Removed */}
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <Header transparent activeTab="admin" />
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black flex items-center gap-2 text-white drop-shadow-md">
                                    <Shield className="h-8 w-8 text-orange-400" />
                                    لظˆحة طھحظƒم المدير
                                </h1>
                                <p className="text-blue-200 mt-2 font-medium">إدارة المسطھخدمظٹنطŒ الاشطھراظƒاطھطŒ ظˆحظر الحساباطھ</p>
                            </div>
                            <Button variant="outline" onClick={() => navigate("/")} className="bg-white/10 hover:bg-white/20 text-white border-white/20">العودة للرئظٹسظٹة</Button>
                        </div>

                        <div className="grid gap-6">
                            <Card className="border-white/20 shadow-2xl bg-white/10 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-white">قائمة المشطھرظƒظٹن ({users.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
                                        <table className="w-full text-sm">
                                            <thead className="bg-blue-900/40 border-b border-white/10 text-white">
                                                <tr>
                                                    <th className="p-4 text-right">البرظٹد الإلكطھرظˆنظٹ</th>
                                                    <th className="p-4 text-right">الحالة</th>
                                                    <th className="p-4 text-right">طھارظٹخ الانطھهاط،</th>
                                                    <th className="p-4 text-right">الإجراط،اطھ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-white/5 transition-colors text-blue-50">
                                                        <td className="p-4">{user.email}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'active'
                                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                                }`}>
                                                                {user.status === 'active' ? 'نشط' : 'محظظˆر'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-orange-400" />
                                                            {new Date(user.expiry_date).toLocaleDateString('ar-JO')}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-white/20 hover:bg-white/10 text-white hover:text-orange-400"
                                                                    onClick={() => handleExtendExpiry(user.id, user.expiry_date)}
                                                                >
                                                                    تمدظٹد
                                                                </Button>
                                                                {user.status === 'active' ? (
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="bg-red-500/80 hover:bg-red-600"
                                                                        onClick={() => handleStatusChange(user.id, 'banned')}
                                                                    >
                                                                        <UserX className="h-4 w-4" />
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                                                                        onClick={() => handleStatusChange(user.id, 'active')}
                                                                    >
                                                                        <UserCheck className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Admin;
