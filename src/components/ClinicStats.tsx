import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { appointmentsApi } from "@/lib/api";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Calendar, CheckCircle, TrendingUp,
    ArrowUpRight, Activity, Clock, AlertCircle, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { ClinicStatsSkeleton } from "@/components/skeletons/ClinicStatsSkeleton";

const COLORS = ['#1d4ed8', '#f97316', '#3b82f6', '#ef4444', '#8b5cf6'];

const statusLabel: Record<string, string> = {
    scheduled: 'مجدول',
    pending: 'بانتظار التأكيد',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغى',
};

export const ClinicStats = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["clinic-stats"],
        queryFn: () => appointmentsApi.getStats(),
        refetchInterval: 30000,
    });

    if (isLoading) return <ClinicStatsSkeleton />;

    const summaryCards = [
        {
            title: "إجمالي المرضى",
            value: stats?.total_patients || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100",
            trend: `${stats?.total_patients || 0} مريض مسجل`,
        },
        {
            title: "مواعيد اليوم",
            value: stats?.today_total || 0,
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-100",
            trend: `${stats?.today_waiting || 0} في الانتظار`,
        },
        {
            title: "مكتملة اليوم",
            value: stats?.today_completed || 0,
            icon: CheckCircle,
            color: "text-primary",
            bg: "bg-primary/10",
            trend: `من أصل ${stats?.today_total || 0} موعد`,
        },
        {
            title: "مواعيد الشهر",
            value: stats?.this_month || 0,
            icon: TrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-100",
            trend: `${stats?.this_month_completed || 0} مكتمل هذا الشهر`,
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10" dir="rtl">

            {/* ── بطاقات الإحصائيات الرئيسية ─────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {summaryCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{
                            type: "spring" as const,
                            stiffness: 400,
                            damping: 25,
                            delay: idx * 0.1,
                        }}
                    >
                        <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group p-6 h-full cursor-pointer flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
                            <div className="relative z-20 flex justify-between items-start mb-4">
                                <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm flex items-center justify-center">
                                    <card.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" strokeWidth={2} />
                                </div>
                                <p className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="h-3 w-3" />
                                    {card.trend}
                                </p>
                            </div>
                            <div className="relative z-20 flex flex-col items-start gap-1">
                                <p className="text-xs md:text-sm font-bold text-slate-500">{card.title}</p>
                                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 font-display">
                                    {card.value}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── المخططات البيانية ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* مخطط نشاط العيادة الأسبوعي */}
                <Card className="lg:col-span-2 p-8 border border-orange-500 rounded-md shadow-sm bg-white relative group overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors shadow-sm shrink-0">
                                <Activity className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                                    نشاط العيادة
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        الزيارات الأسبوعية
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.last7Days || []}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visits"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisits)"
                                    name="زيارات"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* مخطط توزيع الحالات */}
                <Card className="p-8 border border-orange-500 rounded-md shadow-sm bg-white relative group overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />

                    <div className="mb-8 relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors shadow-sm shrink-0">
                            <PieChart className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900">
                                توزيع الحالات
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    إحصائيات المواعيد
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {(stats?.statusDistribution || []).map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any, name: any) => [value, statusLabel[name] || name]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black">{stats?.today_total || 0}</span>
                            <span className="text-[10px] text-muted-foreground">إجمالي اليوم</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {(stats?.statusDistribution || []).map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-sm font-medium">
                                        {statusLabel[entry.name] || entry.name}
                                    </span>
                                </div>
                                <span className="text-xs font-bold">{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ── رؤى إضافية ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <Card className="p-8 border border-orange-500 rounded-md shadow-sm bg-white relative group transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />
                    <div className="flex items-center gap-4 mb-4 relative z-20">
                        <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm shrink-0">
                            <Clock className="h-6 w-6" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-lg">أوقات الذروة</h4>
                    </div>
                    <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                        أكثر الأوقات ازدحاماً هي الفترة الصباحية بين الساعة ٩ و ١١ صباحاً.
                        تأكد من توفير طاقم عمل كافٍ خلال هذه الفترة لتقليل وقت انتظار المرضى.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {['٩ص', '١٠ص', '١١ص'].map(t => (
                            <div key={t} className="text-center p-2 bg-primary/5 rounded-lg">
                                <p className="text-xs font-black text-primary">{t}</p>
                                <div className="h-2 bg-primary/30 rounded mt-1" />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 border border-orange-500 rounded-md shadow-sm bg-white relative group transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />
                    <div className="flex items-center gap-4 mb-4 relative z-20">
                        <div className="p-2.5 bg-orange-50 text-orange-500 border border-orange-100 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-sm shrink-0">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-lg">نصائح لتحسين الأداء</h4>
                    </div>
                    <p className="text-muted-foreground text-sm font-bold leading-relaxed">
                        فعّل رسائل التذكير التلقائية عبر واتساب قبل ٢٤ ساعة من الموعد
                        لتقليل حالات عدم الحضور وتحسين تجربة المريض.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-orange-500 font-bold">
                        <AlertCircle className="h-3 w-3" />
                        <span>ننصح بتفعيل الإشعارات التلقائية</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};
