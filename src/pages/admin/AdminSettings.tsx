import { useState, useEffect } from "react";
import { dataApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { toastWithSound } from "@/lib/toast-with-sound";

const AdminSettings = () => {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await dataApi.get('/admin/settings');
            const settingsObj: any = {};
            data.forEach((item: any) => {
                settingsObj[item.key] = item.value;
            });
            setSettings(settingsObj);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toastWithSound.error('فشل في جلب الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        try {
            setSaving(true);
            await dataApi.put(`/admin/settings/${key}`, { value });
            toastWithSound.success('تم حفظ الإعداد');
        } catch (error) {
            toastWithSound.error('فشل في حفظ الإعداد');
        } finally {
            setSaving(false);
        }
    };

    const settingsConfig = [
        { key: 'app_name', label: 'اسم التطبيق', placeholder: 'حكيم' },
        { key: 'support_email', label: 'بريد الدعم', placeholder: 'support@hakeem.jo' },
        { key: 'support_phone', label: 'هاتف الدعم', placeholder: '+962...' },
        { key: 'trial_days', label: 'أيام الفترة التجريبية', placeholder: '7', type: 'number' },
        { key: 'max_users', label: 'الحد الأقصى للمستخدمين', placeholder: '1000', type: 'number' },
        { key: 'maintenance_mode', label: 'وضع الصيانة', placeholder: 'false', type: 'select', options: ['true', 'false'] },
    ];

    if (loading) {
        return <div className="text-center py-12">جاري التحميل...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-black">إعدادات النظام</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {settingsConfig.map((config) => (
                    <Card key={config.key} className="p-6 border-orange-100 shadow-md">
                        <div className="space-y-4">
                            <Label className="text-base font-bold">{config.label}</Label>
                            
                            {config.type === 'select' ? (
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    value={settings[config.key] || config.placeholder}
                                    onChange={(e) => setSettings({ ...settings, [config.key]: e.target.value })}
                                >
                                    {config.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    type={config.type || 'text'}
                                    value={settings[config.key] || ''}
                                    onChange={(e) => setSettings({ ...settings, [config.key]: e.target.value })}
                                    placeholder={config.placeholder}
                                />
                            )}

                            <Button
                                onClick={() => handleSave(config.key, settings[config.key])}
                                disabled={saving}
                                className="w-full gap-2"
                            >
                                <Save className="h-4 w-4" />
                                حفظ
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-6 border-orange-100 shadow-md bg-gradient-to-br from-blue-50 to-orange-50">
                <h3 className="text-xl font-black mb-4">معلومات النظام</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-600">إصدار التطبيق:</span>
                        <span className="font-bold mr-2">1.0.0</span>
                    </div>
                    <div>
                        <span className="text-slate-600">آخر تحديث:</span>
                        <span className="font-bold mr-2">{new Date().toLocaleDateString('ar-JO')}</span>
                    </div>
                    <div>
                        <span className="text-slate-600">البيئة:</span>
                        <span className="font-bold mr-2">Production</span>
                    </div>
                    <div>
                        <span className="text-slate-600">قاعدة البيانات:</span>
                        <span className="font-bold mr-2">PostgreSQL</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminSettings;
