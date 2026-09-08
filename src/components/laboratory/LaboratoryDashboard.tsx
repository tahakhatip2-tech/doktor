import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FlaskConical, Users, ClipboardList, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/lib/api';
import LabOrders from './LabOrders';
import LabTestsManager from './LabTestsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LaboratoryDashboardProps {
    initialTab?: "orders" | "tests";
}

export default function LaboratoryDashboard({ initialTab = "orders" }: LaboratoryDashboardProps = {}) {
    const [stats, setStats] = useState({
        totalTests: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalPatients: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch from /api/laboratory/stats
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                        <FlaskConical className="h-8 w-8" />
                    </div>
                    لوحة تحكم المختبر
                </h1>
                <p className="text-muted-foreground">أهلاً بك في نظام إدارة المختبرات الطبية الذكي</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-100 dark:border-red-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-red-800 dark:text-red-200">الطلبات المعلقة</CardTitle>
                        <ClipboardList className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-red-700 dark:text-red-300">{stats.pendingOrders}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-green-800 dark:text-green-200">الطلبات المنجزة</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-green-700 dark:text-green-300">{stats.completedOrders}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-blue-800 dark:text-blue-200">المرضى المسجلين</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-blue-700 dark:text-blue-300">{stats.totalPatients}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-100 dark:border-purple-900/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-purple-800 dark:text-purple-200">إجمالي الفحوصات المتاحة</CardTitle>
                        <FlaskConical className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-purple-700 dark:text-purple-300">{stats.totalTests}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={initialTab} className="w-full">
                <TabsList className="w-full max-w-md grid grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">طلبات الفحوصات</TabsTrigger>
                    <TabsTrigger value="tests" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-red-600 data-[state=active]:shadow-sm">إدارة قائمة الفحوصات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-6 focus-visible:outline-none">
                    <LabOrders />
                </TabsContent>
                
                <TabsContent value="tests" className="mt-6 focus-visible:outline-none">
                    <LabTestsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
