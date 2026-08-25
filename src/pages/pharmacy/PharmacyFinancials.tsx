import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, RefreshCcw, Wallet,
  ShoppingCart, Pill, Package, AlertTriangle, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { API_URL } from '@/lib/api';

// ── Pharmacy-specific API helper (uses pharmacy_token) ─────────────────────────
const pharmacyFetch = async (endpoint: string) => {
  const token = localStorage.getItem('pharmacy_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const accent = '#10b981';
const accentText = 'text-emerald-600';
const accentBg = 'bg-emerald-50';

export default function PharmacyFinancials() {
  const [stats, setStats] = useState<any>({
    todayIncome: 0, monthIncome: 0, totalIncome: 0,
    totalTransactions: 0, prescriptionsDispensed: 0, pendingPrescriptions: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, historyRes, advRes] = await Promise.all([
        pharmacyFetch('/finance/stats'),
        pharmacyFetch('/finance/chart'),
        pharmacyFetch('/finance/history?limit=10'),
        pharmacyFetch('/finance/pharmacy/advanced'),
      ]);
      setStats(statsRes);
      setChartData(chartRes);
      setHistory(historyRes);
      setAdvancedStats(advRes);
    } catch (err) {
      console.error('Pharmacy finance load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'مبيعات اليوم', value: stats.todayIncome, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', isCurrency: true },
    { title: 'مبيعات الشهر', value: stats.monthIncome, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', isCurrency: true },
    { title: 'إجمالي المبيعات', value: stats.totalIncome, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', isCurrency: true },
    { title: 'الوصفات المصروفة', value: stats.prescriptionsDispensed, icon: Pill, color: 'text-purple-500', bg: 'bg-purple-50', isCurrency: false },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin mb-4" />
        <span className="text-slate-500 font-bold text-sm">جاري تحميل بيانات الصيدلية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" dir="rtl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Pill className="h-8 w-8 text-emerald-500" />
            إيرادات الصيدلية
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">نظرة عامة على مبيعات الأدوية والوصفات المصروفة</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.pendingPrescriptions > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold">
              <ClipboardList className="h-4 w-4" />
              {stats.pendingPrescriptions} وصفة معلقة
            </Badge>
          )}
          <Button variant="outline" onClick={loadData} className="bg-white border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 shadow-sm">
            <RefreshCcw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">{stat.title}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {Number(stat.value).toFixed(stat.isCurrency ? 2 : 0)}
                    {stat.isCurrency && <span className="text-xs text-slate-400 font-bold mr-1">د.أ</span>}
                  </p>
                </div>
                <div className={`p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Chart + History ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 z-10" />
          <div className="border-b border-slate-100 bg-slate-50/70 py-4 px-6">
            <h3 className="text-lg font-black text-slate-900">منحنى المبيعات (آخر 30 يوم)</h3>
          </div>
          <CardContent className="p-6 h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pharmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => format(new Date(v), 'd MMM', { locale: ar })} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }} formatter={(v) => [`${Number(v).toFixed(2)} د.أ`, 'المبيعات']} labelFormatter={(l) => format(new Date(l), 'd MMMM yyyy', { locale: ar })} />
                  <Area type="monotone" dataKey="amount" stroke={accent} strokeWidth={3} fillOpacity={1} fill="url(#pharmGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <TrendingDown className="h-10 w-10 mb-2 opacity-50" />
                <p className="font-bold text-sm">لا توجد مبيعات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 z-10" />
          <div className="border-b border-slate-100 bg-slate-50/70 py-4 px-6 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">آخر المبيعات</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">آخر 10</span>
          </div>
          <CardContent className="p-0 overflow-y-auto max-h-[300px]">
            {history.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {history.map((item: any, idx: number) => (
                  <div key={idx} className="px-4 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Pill className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{item.patientName}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[120px]">{item.details}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-sm text-emerald-600">{item.amount.toFixed(2)} <span className="text-[10px] opacity-70">د.أ</span></span>
                      <span className="text-[10px] text-slate-400">{format(new Date(item.date), 'd MMM', { locale: ar })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm font-bold">لا توجد سجلات مبيعات بعد.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Advanced Analytics ─────────────────────────────────── */}
      {advancedStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Selling Meds */}
          <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 z-10" />
            <div className="border-b bg-emerald-50/60 py-4 px-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">الأدوية الأكثر مبيعاً</h3>
            </div>
            <CardContent className="p-0">
              {advancedStats.topMedications?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {advancedStats.topMedications.map((drug: any, idx: number) => (
                    <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                        <span className="text-sm font-bold text-slate-800">{drug.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-600">{drug.totalSold} وحدة</span>
                        <span className="text-[11px] text-slate-400">{Number(drug.totalRevenue).toFixed(2)} د.أ</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">لا توجد بيانات مبيعات.</div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 z-10" />
            <div className="border-b bg-amber-50/60 py-4 px-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">مخزون منخفض</h3>
            </div>
            <CardContent className="p-0">
              {advancedStats.lowStock?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {advancedStats.lowStock.map((item: any, idx: number) => (
                    <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          {item.expiryDate && (
                            <p className="text-[11px] text-slate-400">ينتهي: {format(new Date(item.expiryDate), 'd MMM yyyy', { locale: ar })}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-xs font-black ${item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.stock} متبقي
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">المخزون بخير ✅</div>
              )}
            </CardContent>
          </Card>

          {/* Pending Rx */}
          <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-purple-500 z-10" />
            <div className="border-b bg-purple-50/60 py-4 px-6 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-600" />
              <h3 className="text-base font-black text-slate-900">الوصفات المعلقة</h3>
            </div>
            <CardContent className="p-0">
              {advancedStats.pendingPrescriptions?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {advancedStats.pendingPrescriptions.map((rx: any, idx: number) => (
                    <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Pill className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{rx.patientName}</p>
                          <p className="text-[11px] text-slate-400">{format(new Date(rx.date), 'd MMM', { locale: ar })}</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 text-xs font-bold">#{rx.id}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">لا توجد وصفات معلقة 🎉</div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
