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
                        <Card className="p-6 border-y border-white/5 bg-blue-950/5 backdrop-blur-[80px] rounded-none shadow-2xl relative group overflow-hidden transition-all duration-700 hover:shadow-primary/20 h-full cursor-pointer">
                            <div className="light-sweep opacity-30" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                        {card.title}
                                    </p>
                                    <h4 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">
                                        {card.value}
                                    </h4>
                                    <p className="text-[10px] font-black text-green-500 flex items-center gap-1 uppercase tracking-widest">
                                        <ArrowUpRight className="h-3 w-3" />
                                        {card.trend}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center border border-primary/20 transition-all duration-700 group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-lg group-hover:rotate-12">
                                    <card.icon className="h-6 w-6" strokeWidth={1.5} />
                                </div>
                            </div>

                            {/* Bottom Power Line */}
                            <div className="absolute bottom-0 left-0 w-full flex opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
                                <div className="h-[3px] w-2/5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                                <div className="h-[3px] flex-1 bg-white/5" />
                            </div>
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── المخططات البيانية ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* مخطط نشاط العيادة الأسبوعي */}
                <Card className="lg:col-span-2 p-8 border-y border-white/5 rounded-none shadow-2xl bg-blue-950/5 backdrop-blur-[100px] relative group overflow-hidden transition-all duration-700 hover:shadow-primary/5">
                    <div className="light-sweep opacity-[0.15]" />

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                            <div className="flex flex-col">
                                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-foreground">
                                    نشاط العيادة
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
                                        CLINIC_ACTIVITY_v1
                                    </span>
                                    <div className="h-px w-8 bg-white/10" />
                                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-wider">
                                        الزيارات الأسبوعية
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Activity className="h-8 w-8 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full flex opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="h-[2px] w-1/4 bg-primary" />
                        <div className="h-[2px] flex-1 bg-white/5" />
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
                <Card className="p-8 border-y border-white/5 rounded-none shadow-2xl bg-blue-950/5 backdrop-blur-[100px] relative group overflow-hidden transition-all duration-700 hover:shadow-primary/5">
                    <div className="light-sweep opacity-[0.15]" />

                    <div className="mb-8 relative z-10 flex items-center gap-5">
                        <div className="h-14 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                        <div className="flex flex-col">
                            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-foreground">
                                توزيع الحالات
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">
                                    ANALYTICS_CORE
                                </span>
                                <div className="h-px w-8 bg-white/10" />
                                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-wider">
                                    إحصائيات المواعيد
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full flex opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="h-[2px] w-1/2 bg-primary" />
                        <div className="h-[2px] flex-1 bg-white/5" />
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

                <Card className="p-8 border border-white/5 rounded-none shadow-xl bg-blue-950/5 backdrop-blur-[60px] relative group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 bg-primary/10 text-primary border border-primary/20">
                            <Clock className="h-6 w-6" />
                        </div>
                        <h4 className="font-black italic uppercase tracking-tighter">أوقات الذروة</h4>
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

                <Card className="p-8 border border-white/5 rounded-none shadow-xl bg-blue-950/5 backdrop-blur-[60px] relative group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 bg-orange-500/10 text-orange-500 border border-orange-500/20">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h4 className="font-black italic uppercase tracking-tighter">نصائح لتحسين الأداء</h4>
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
