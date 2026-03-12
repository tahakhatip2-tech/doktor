import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw, FileText, ArrowUpRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dataApi } from '@/lib/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981'];

export default function FinancialAnalytics() {
  const [stats, setStats] = useState({ todayIncome: 0, monthIncome: 0, totalIncome: 0, totalTransactions: 0 });
  const [chartData, setChartData] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, historyRes] = await Promise.all([
        dataApi.get('/finance/stats'),
        dataApi.get('/finance/chart'),
        dataApi.get('/finance/history?limit=10')
      ]);
      setStats(statsRes);
      setChartData(chartRes);
      setHistory(historyRes);
    } catch (error) {
      console.error('Failed to load financial data', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'أرباح اليوم', value: stats.todayIncome, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'أرباح الشهر', value: stats.monthIncome, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'إجمالي الأرباح', value: stats.totalIncome, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'العمليات المكتملة', value: stats.totalTransactions, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', isNumber: true },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
         <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin mb-4" />
         <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">جاري معالجة البيانات المالية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
             <Wallet className="h-8 w-8 text-orange-500" />
             المحاسبة والأرباح
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-2">نظرة عامة على الإيرادات والمطالبات المالية</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData}
          className="bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="relative rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-orange-500 transition-all duration-300 overflow-hidden group">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${idx % 2 === 0 ? 'bg-gradient-to-b from-blue-600 to-orange-500' : 'bg-gradient-to-b from-orange-500 to-blue-600'}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-2">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-900">
                    {stat.value} {stat.isNumber ? '' : <span className="text-sm text-slate-400 font-bold">د.أ</span>}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border shadow-sm group-hover:scale-110 transition-transform ${stat.bg} ${stat.color} border-${stat.color.replace('text-', '')}/20`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="lg:col-span-2 relative rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 z-10" />
          <div className="border-b border-slate-100 bg-slate-50 py-4 px-6 relative z-20">
            <h3 className="text-lg font-black text-slate-900">منحنى الأرباح (آخر 30 يوم)</h3>
          </div>
          <CardContent className="p-6 h-[350px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 12, fill: '#64748b' }} 
                       tickFormatter={(val) => {
                          const date = new Date(val);
                          return format(date, 'd MMM', { locale: ar });
                       }}
                    />
                    <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 12, fill: '#64748b' }} 
                    />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       formatter={(value) => [`${value} د.أ`, 'الدخل']}
                       labelFormatter={(label) => format(new Date(label), 'd MMMM yyyy', { locale: ar })}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <TrendingDown className="h-10 w-10 mb-2 opacity-50" />
                  <p className="font-bold text-sm">لا توجد حركات مالية كافية للرسم</p>
                </div>
             )}
          </CardContent>
        </Card>

        {/* Recent Transactions List */}
        <Card className="relative rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-orange-500 z-10" />
          <div className="border-b border-slate-100 bg-slate-50 py-4 px-6 relative z-20 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">آخر الكشفيات</h3>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-sm">آخر 10</span>
          </div>
          <CardContent className="p-0 overflow-y-auto max-h-[350px] custom-scrollbar">
            {history.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {history.map((item, idx) => (
                   <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                     <div className="flex flex-col">
                       <span className="font-bold text-sm text-slate-900">{item.patientName}</span>
                       <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[150px] mt-0.5">{item.details}</span>
                     </div>
                     <div className="flex flex-col items-end">
                       <span className="font-black text-orange-600 text-sm">{item.amount.toFixed(2)} <span className="text-[10px] text-orange-400">د.أ</span></span>
                       <span className="text-[10px] text-slate-400 mt-0.5">
                         {format(new Date(item.date), 'd MMM', { locale: ar })}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
               <div className="p-8 text-center text-slate-400 text-sm font-bold">لا توجد سجلات مالية بعد.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
