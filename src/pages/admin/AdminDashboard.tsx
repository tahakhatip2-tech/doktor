import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

const COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#ef4444'];

interface AdminDashboardProps {
    stats: any;
}

const AdminDashboard = ({ stats }: AdminDashboardProps) => {
    if (!stats) return <div>جاري التحميل...</div>;

    const subscriptionData = stats.subscriptionDistribution?.map((item: any) => ({
        name: item.status === 'TRIAL' ? 'تجريبي' : 
              item.status === 'ACTIVE' ? 'نشط' : 
              item.status === 'CANCELED' ? 'ملغي' : 
              item.status === 'PAST_DUE' ? 'متأخر' : 'مجاني',
        value: item.count
    })) || [];

    return (
        <div className="space-y-8">
            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="border-orange-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            الإيرادات الشهرية
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueByMonth || []}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#64748b' }} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#64748b' }} 
                                    />
                                    <Tooltip
                                        contentStyle={{ 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        name="الإيرادات"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-orange-100 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-5 w-5 text-orange-600" />
                                نمو المستخدمين
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.userGrowth || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="month" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ 
                                                borderRadius: '12px', 
                                                border: 'none', 
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                padding: '12px'
                                            }}
                                        />
                                        <Bar dataKey="users" fill="#f97316" radius={[8, 8, 0, 0]} name="المستخدمين الجدد" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Subscription Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-orange-100 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                توزيع الاشتراكات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={subscriptionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {subscriptionData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-slate-900">{stats.totalUsers}</span>
                                    <span className="text-xs text-slate-500 font-bold">إجمالي المستخدمين</span>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                {subscriptionData.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="h-3 w-3 rounded-full" 
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                                            />
                                            <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Top Customers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="border-orange-100 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            أفضل العملاء (الإيرادات)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-right py-3 px-4 font-bold text-slate-700">#</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-700">العيادة</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-700">البريد</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-700">المدفوعات</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-700">الإيرادات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(stats.topCustomers || []).map((customer: any, index: number) => (
                                        <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 text-slate-600 font-medium">{index + 1}</td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {customer.clinic_name || customer.name || 'غير محدد'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">{customer.email}</td>
                                            <td className="py-3 px-4 text-slate-600">{customer.paymentsCount}</td>
                                            <td className="py-3 px-4 font-bold text-green-600">
                                                {Number(customer.totalRevenue).toFixed(2)} د.أ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
