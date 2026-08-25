import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  Wallet, TrendingUp, TrendingDown, RefreshCcw, FileText, DollarSign,
  ShoppingCart, Pill, Package, AlertTriangle, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dataApi } from '@/lib/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { HeroSection } from '@/components/HeroSection';

export default function FinancialAnalytics() {
  const { user } = useAuth();
  const isPharmacy = user?.role === 'PHARMACY';

  const [stats, setStats] = useState<any>({
    todayIncome: 0, monthIncome: 0, totalIncome: 0, totalTransactions: 0,
    prescriptionsDispensed: 0, pendingPrescriptions: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const requests: Promise<any>[] = [
        dataApi.get('/finance/stats'),
        dataApi.get('/finance/chart'),
        dataApi.get('/finance/history?limit=10'),
      ];
      if (isPharmacy) {
        requests.push(dataApi.get('/finance/pharmacy/advanced'));
      }
      const [statsRes, chartRes, historyRes, advRes] = await Promise.all(requests);
      setStats(statsRes);
      setChartData(chartRes);
      setHistory(historyRes);
      if (advRes) setAdvancedStats(advRes);
    } catch (error) {
      console.error('Failed to load financial data', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Dynamic config based on role ────────────────────────────────────────────
  const accent = isPharmacy ? '#10b981' : '#f97316';       // emerald vs orange
  const accentLight = isPharmacy ? '#d1fae5' : '#ffedd5';
  const accentText = isPharmacy ? 'text-emerald-600' : 'text-orange-600';
  const accentBg = isPharmacy ? 'bg-emerald-50' : 'bg-orange-50';
  const borderAccent = isPharmacy ? 'border-emerald-500' : 'border-orange-500';
  const spinnerAccent = isPharmacy ? 'border-t-emerald-500' : 'border-t-orange-500';
  const gradientAccent = isPharmacy ? 'from-emerald-500 to-teal-600' : 'from-blue-600 to-orange-500';

  const pageTitle = isPharmacy ? 'إيرادات الصيدلية' : 'المحاسبة والأرباح';
  const pageSubtitle = isPharmacy
    ? 'نظرة عامة على مبيعات الأدوية والوصفات المصروفة'
    : 'نظرة عامة على الإيرادات والمطالبات المالية';
  const chartTitle = isPharmacy ? 'منحنى المبيعات (آخر 30 يوم)' : 'منحنى الأرباح (آخر 30 يوم)';
  const tooltipLabel = isPharmacy ? 'المبيعات' : 'الدخل';
  const historyTitle = isPharmacy ? 'آخر المبيعات' : 'آخر الكشفيات';
  const historyNameKey = isPharmacy ? 'patientName' : 'patientName'; // same field name from backend

  const statCards = isPharmacy
    ? [
        { title: 'مبيعات اليوم', value: stats.todayIncome, icon: ShoppingCart, bgClass: 'bg-gradient-to-l from-emerald-500 from-50% to-emerald-400 to-50%', isCurrency: true },
        { title: 'مبيعات الشهر', value: stats.monthIncome, icon: Wallet, bgClass: 'bg-gradient-to-l from-blue-500 from-50% to-blue-400 to-50%', isCurrency: true },
        { title: 'إجمالي المبيعات', value: stats.totalIncome, icon: TrendingUp, bgClass: 'bg-gradient-to-l from-orange-500 from-50% to-orange-400 to-50%', isCurrency: true },
        { title: 'الوصفات المصروفة', value: stats.prescriptionsDispensed, icon: Pill, bgClass: 'bg-gradient-to-l from-purple-600 from-50% to-purple-500 to-50%', isCurrency: false },
      ]
    : [
        { title: 'أرباح اليوم', value: stats.todayIncome, icon: DollarSign, bgClass: 'bg-gradient-to-l from-orange-500 from-50% to-orange-400 to-50%', isCurrency: true },
        { title: 'أرباح الشهر', value: stats.monthIncome, icon: Wallet, bgClass: 'bg-gradient-to-l from-blue-500 from-50% to-blue-400 to-50%', isCurrency: true },
        { title: 'إجمالي الأرباح', value: stats.totalIncome, icon: TrendingUp, bgClass: 'bg-gradient-to-l from-emerald-500 from-50% to-emerald-400 to-50%', isCurrency: true },
        { title: 'العمليات المكتملة', value: stats.totalTransactions, icon: FileText, bgClass: 'bg-gradient-to-l from-purple-600 from-50% to-purple-500 to-50%', isCurrency: false },
      ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className={`h-12 w-12 rounded-full border-4 border-slate-200 ${spinnerAccent} animate-spin mb-4`} />
        <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">
          {isPharmacy ? 'جاري تحميل بيانات الصيدلية...' : 'جاري معالجة البيانات المالية...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12" dir="rtl">
      
      <HeroSection 
        pageTitle={pageTitle}
        doctorName={isPharmacy ? "نظام الصيدلية" : "النظام المالي"}
        description={pageSubtitle}
        backgroundImage={isPharmacy ? "/pharmacy-finance-bg.jpg" : undefined}
        isPharmacy={isPharmacy}
        icon={isPharmacy ? Pill : Wallet}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base sm:text-2xl font-black text-slate-900 flex items-center gap-2 whitespace-nowrap">
            <div className={`p-1.5 rounded-xl shadow-inner text-white flex-shrink-0 bg-gradient-to-br ${gradientAccent}`}>
              {isPharmacy ? <Pill className="h-4 w-4 sm:h-5 sm:w-5" /> : <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />}
            </div>
            {pageTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Pharmacy: pending prescriptions badge */}
          {isPharmacy && stats.pendingPrescriptions > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
              <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4" />
              {stats.pendingPrescriptions} وصفة معلقة
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={loadData}
            className="rounded-full bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm text-xs sm:text-sm h-9 sm:h-10"
          >
            <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <Card
            key={idx}
            className={`relative rounded-full border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group ${stat.bgClass} text-white`}
          >
            {/* Capsule Middle Shine Divider */}
            <div className="absolute top-0 right-1/2 w-1.5 h-full bg-white/20 backdrop-blur-sm z-0 transform translate-x-1/2" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
            
            <CardContent className="py-2.5 sm:py-4 px-4 sm:px-6 relative z-10 flex items-center justify-between">
              <div className="flex-1 text-right ml-2">
                <p className="text-[10px] sm:text-xs font-bold text-white/90 mb-0.5 line-clamp-1">{stat.title}</p>
                <p className="text-sm sm:text-xl font-black text-white whitespace-nowrap">
                  {typeof stat.value === 'number' ? stat.value.toFixed(stat.isCurrency ? 2 : 0) : 0}
                  {stat.isCurrency && <span className="text-[9px] sm:text-xs font-bold mx-1 opacity-80">د.أ</span>}
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-full bg-white/20 backdrop-blur-md shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Chart + History ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <Card className="lg:col-span-2 relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className={`absolute top-0 right-0 w-1 h-full z-10`} style={{ backgroundColor: accent }} />
          <div className="border-b border-slate-100 bg-slate-50/70 py-4 px-6 relative z-20">
            <h3 className="text-lg font-black text-slate-900">{chartTitle}</h3>
          </div>
          <CardContent className="p-6 h-[320px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(val) => format(new Date(val), 'd MMM', { locale: ar })}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${Number(value).toFixed(2)} د.أ`, tooltipLabel]}
                    labelFormatter={(label) => format(new Date(label), 'd MMMM yyyy', { locale: ar })}
                  />
                  <Area type="monotone" dataKey="amount" stroke={accent} strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
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

        {/* Recent Transactions */}
        <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className={`absolute top-0 right-0 w-1 h-full z-10`} style={{ backgroundColor: accent }} />
          <div className="border-b border-slate-100 bg-slate-50/70 py-4 px-6 relative z-20 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900">{historyTitle}</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${accentText} ${accentBg}`}>آخر 10</span>
          </div>
          <CardContent className="p-0 overflow-y-auto max-h-[320px] custom-scrollbar">
            {history.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {history.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accentBg}`}>
                        {isPharmacy
                          ? <Pill className={`h-4 w-4 ${accentText}`} />
                          : <FileText className={`h-4 w-4 ${accentText}`} />
                        }
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900">{item.patientName}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[130px] mt-0.5">{item.details}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-black text-sm ${accentText}`}>
                        {item.amount.toFixed(2)} <span className="text-[10px] opacity-70">د.أ</span>
                      </span>
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

      {/* ── Pharmacy Advanced Analytics ────────────────────────── */}
      {isPharmacy && advancedStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Selling Medications */}
          <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 z-10" />
            <div className="border-b border-slate-100 bg-emerald-50/60 py-4 px-6 relative z-20 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">الأدوية الأكثر مبيعاً</h3>
            </div>
            <CardContent className="p-0">
              {advancedStats.topMedications?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {advancedStats.topMedications.map((drug: any, idx: number) => (
                    <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{drug.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-600">{drug.totalSold} وحدة</span>
                        <span className="text-[11px] text-slate-400">{drug.totalRevenue.toFixed(2)} د.أ</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">لا توجد بيانات مبيعات بعد.</div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 z-10" />
            <div className="border-b border-slate-100 bg-amber-50/60 py-4 px-6 relative z-20 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">تنبيه المخزون المنخفض</h3>
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
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{item.name}</span>
                          {item.expiryDate && (
                            <span className="text-[11px] text-slate-400">
                              ينتهي: {format(new Date(item.expiryDate), 'd MMM yyyy', { locale: ar })}
                            </span>
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

          {/* Pending Prescriptions */}
          <Card className="relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-purple-500 z-10" />
            <div className="border-b border-slate-100 bg-purple-50/60 py-4 px-6 relative z-20 flex items-center gap-2">
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
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{rx.patientName}</span>
                          <span className="text-[11px] text-slate-400">
                            {format(new Date(rx.date), 'd MMM', { locale: ar })}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700 text-xs font-bold">وصفة #{rx.id}</Badge>
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
