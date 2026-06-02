import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';

export default function PharmacyNotifications() {
    const { pharmacy, loading } = usePharmacyAuth(true);

    if (loading || !pharmacy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 max-w-3xl mx-auto" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg">
                    <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-blue-900">الإشعارات</h1>
                    <p className="text-sm text-blue-600/70 font-medium">تابع آخر التحديثات والتنبيهات</p>
                </div>
            </div>

            <Card className="p-12 text-center rounded-3xl border-dashed">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground text-sm">
                    ستظهر هنا الإشعارات عند توفرها (وصفات جديدة، رسائل، تحديثات).
                </p>
            </Card>
        </div>
    );
}
