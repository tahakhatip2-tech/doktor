import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { MessageSquare, Zap, ArrowUpRight, TrendingUp, Users } from 'lucide-react';

const COLORS = ['#1d4ed8', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BotAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:3001/api/whatsapp/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) return <div className="p-12 text-center text-muted-foreground">جارظٹ تحميل الإحصائيات...</div>;

    const stats = [
        { title: 'إجمالظٹ الردظˆد الآلظٹة', value: data.stats.auto_replies, icon: Zap, color: 'text-yellow-500' },
        { title: 'الرسائل المسطھلمة', value: data.stats.incoming_messages, icon: MessageSquare, color: 'text-blue-500' },
        { title: 'الرسائل المرسلة', value: data.stats.outgoing_messages, icon: ArrowUpRight, color: 'text-primary' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-bold">إحصائظٹاطھ البظˆطھ</h2>
                    <p className="text-sm text-muted-foreground">نظرة عامة على أداط، نظام الرد الآلظٹ</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />
                        <CardContent className="p-6 relative z-20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                </div>
                                <div className={`p-4 rounded-lg bg-slate-50 border border-slate-100 shadow-sm ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Triggers Chart */}
                <Card className="relative rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 z-10" />
                    <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 relative z-20">
                        <CardTitle className="text-lg font-black text-slate-900">أكثر الكلمات المفتاحية استخداماً</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6 relative z-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topTriggers} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="trigger"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#0f172a' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Engagement Distribution */}
                <Card className="relative rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 h-full bg-orange-500 z-10" />
                    <CardHeader className="border-b border-slate-100 bg-slate-50 py-4 relative z-20">
                        <CardTitle className="text-lg font-black text-slate-900">توزيع التفاعل</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] pt-6 relative z-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'ردود آلية', value: data.stats.auto_replies },
                                        { name: 'رسائل يدوية', value: data.stats.outgoing_messages - data.stats.auto_replies },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[0, 1].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 font-black text-2xl">
                                    {Math.round((data.stats.auto_replies / data.stats.outgoing_messages) * 100) || 0}%
                                    <tspan x="50%" dy="1.5em" fontSize="12" className="fill-slate-500 font-bold">أتمتة</tspan>
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
