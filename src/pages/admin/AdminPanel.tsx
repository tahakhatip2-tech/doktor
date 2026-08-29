import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataApi } from "@/lib/api";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Package,
    Settings,
    TrendingUp,
    DollarSign,
    Calendar,
    Activity,
    UserCheck,
    UserX,
    Clock,
    Megaphone,
    ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminPayments from "./AdminPayments";
import AdminPlans from "./AdminPlans";
import AdminSettings from "./AdminSettings";
import AdminAds from "./AdminAds";

const AdminPanel = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
            if (!token || !user || user.role !== 'ADMIN') {
                navigate("/admin-login");
                return;
            }
            fetchStats();
        }
    }, [user, authLoading, navigate]);

    const fetchStats = async () => {
        try {
            const data = await dataApi.get('/admin/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: "إجمالي المستخدمين",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "blue",
            trend: `+${stats?.activeUsers || 0} نشط`,
            bgGradient: "from-blue-500 to-blue-600"
        },
        {
            title: "الإيرادات الشهرية",
            value: `${stats?.monthlyRevenue || 0} د.أ`,
            icon: DollarSign,
            color: "green",
            trend: "هذا الشهر",
            bgGradient: "from-green-500 to-green-600"
        },
        {
            title: "إجمالي الإيرادات",
            value: `${stats?.totalRevenue || 0} د.أ`,
            icon: TrendingUp,
            color: "purple",
            trend: "من البداية",
            bgGradient: "from-purple-500 to-purple-600"
        },
        {
            title: "المواعيد الشهرية",
            value: stats?.monthlyAppointments || 0,
            icon: Calendar,
            color: "orange",
            trend: `من ${stats?.totalAppointments || 0} إجمالي`,
            bgGradient: "from-orange-500 to-orange-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20" dir="rtl">
            <Header transparent activeTab="admin" />
            
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-3 sm:mb-8 sm:p-6 shadow-sm"
                >
                    <div className="flex items-start gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-700 shadow-sm transition-colors hover:bg-blue-50 sm:h-11 sm:w-11"
                            aria-label="العودة للصفحة السابقة"
                        >
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <div className="shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 p-2.5 shadow-lg sm:rounded-2xl sm:p-3">
                            <LayoutDashboard className="h-5 w-5 text-white sm:h-8 sm:w-8" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                            <h1 className="whitespace-nowrap text-lg font-black leading-tight text-slate-900 sm:text-4xl">لوحة التحكم والإدارة</h1>
                            <p className="mt-1 text-xs font-medium leading-5 text-slate-600 sm:text-base">إدارة شاملة للنظام والمستخدمين والاشتراكات</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {statsCards.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-white/20 group-hover:text-white transition-all`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full group-hover:bg-white/20 group-hover:text-white">
                                            {stat.trend}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 group-hover:text-white/80 mb-1">
                                            {stat.title}
                                        </p>
                                        <p className="text-3xl font-black text-slate-900 group-hover:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Content Tabs */}
                <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b bg-white px-6 pt-6">
                            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:flex sm:justify-start">
                                <TabsTrigger 
                                    value="dashboard" 
                                    className="justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:gap-2 sm:text-sm"
                                >
                                    <Activity className="h-4 w-4" />
                                    لوحة التحكم
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="users"
                                    className="justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:gap-2 sm:text-sm"
                                >
                                    <Users className="h-4 w-4" />
                                    المستخدمين
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="payments"
                                    className="justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:gap-2 sm:text-sm"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    المدفوعات
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="plans"
                                    className="justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:gap-2 sm:text-sm"
                                >
                                    <Package className="h-4 w-4" />
                                    الخطط
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="settings"
                                    className="justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:gap-2 sm:text-sm"
                                >
                                    <Settings className="h-4 w-4" />
                                    الإعدادات
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="ads"
                                    className="justify-center gap-1.5 rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-md sm:gap-2 sm:text-sm"
                                >
                                    <Megaphone className="h-4 w-4" />
                                    الإعلانات
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="bg-white">
                            <TabsContent value="dashboard" className="m-0 p-6">
                                <AdminDashboard stats={stats} />
                            </TabsContent>

                            <TabsContent value="users" className="m-0 p-6">
                                <AdminUsers />
                            </TabsContent>

                            <TabsContent value="payments" className="m-0 p-6">
                                <AdminPayments />
                            </TabsContent>

                            <TabsContent value="plans" className="m-0 p-6">
                                <AdminPlans />
                            </TabsContent>

                            <TabsContent value="settings" className="m-0 p-6">
                                <AdminSettings />
                            </TabsContent>

                            <TabsContent value="ads" className="m-0 p-6">
                                <AdminAds />
                            </TabsContent>
                        </div>
                    </Tabs>
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default AdminPanel;
