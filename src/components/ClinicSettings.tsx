import { useState, useEffect, useRef } from 'react';
import { useClinicContext } from '@/context/ClinicContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Phone, MapPin, Clock, MessageCircle, Calendar, Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { whatsappApi, BASE_URL } from '@/lib/api';

interface ClinicSettings {
    clinic_name: string;
    clinic_description: string;
    clinic_logo: string;
    phone: string;
    emergency_phone: string;
    address: string;
    working_hours_start: string;
    working_hours_end: string;
    appointment_duration: number;
    auto_reply_enabled: boolean;
    reminder_enabled: boolean;
    reminder_time: number;
    location_url: string;
    lat: string;
    lng: string;
}

export default function ClinicSettings() {
    const [settings, setSettings] = useState<ClinicSettings>({
        clinic_name: 'عيادتي',
        clinic_description: 'نظام إدارة العيادات',
        clinic_logo: '/logo.png',
        phone: '',
        emergency_phone: '',
        address: '',
        working_hours_start: '09:00',
        working_hours_end: '17:00',
        appointment_duration: 30,
        auto_reply_enabled: true,
        reminder_enabled: true,
        reminder_time: 60,
        location_url: '',
        lat: '',
        lng: '',
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await whatsappApi.getSettings();
            if (data) {
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    // Ensure booleans and numbers are correctly typed from string values
                    auto_reply_enabled: data.ai_enabled === '1' || data.auto_reply_enabled === '1' || data.auto_reply_enabled === true || data.auto_reply_enabled === 'true',
                    reminder_enabled: data.reminder_enabled === '1' || data.reminder_enabled === true || data.reminder_enabled === 'true',
                    appointment_duration: parseInt(data.appointment_duration) || 30,
                    reminder_time: parseInt(data.reminder_time) || 60,
                }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toastWithSound.error('فشل تحميل الإعدادات');
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const dataToSave = {
                ...settings,
                ai_enabled: settings.auto_reply_enabled ? '1' : '0',
                reminder_enabled: settings.reminder_enabled ? '1' : '0',
            };
            await whatsappApi.updateSettings(dataToSave);
            toastWithSound.success('تم حفظ الإعدادات بنجاح');
            // Refresh the page or broadcast change to sidebar/header if needed
            window.location.reload(); // Simple way to refresh UI components using these settings
        } catch (error) {
            console.error('Error saving settings:', error);
            toastWithSound.error('فشل حفظ الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const data = await whatsappApi.upload(formData);
            if (data.url) {
                updateSetting('clinic_logo', data.url);
                toastWithSound.success('تم رفع الشعار بنجاح');
            }
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            toastWithSound.error(error.message || 'فشل رفع الشعار');
        } finally {
            setUploading(false);
        }
    };

    const updateSetting = (key: keyof ClinicSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toastWithSound.error('متصفحك لا يدعم تحديد الموقع');
            return;
        }

        toastWithSound.success('جاري جلب الموقع...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://maps.google.com/?q=${latitude},${longitude}`;
                updateSetting('location_url', url);
                updateSetting('lat', String(latitude));
                updateSetting('lng', String(longitude));
                toastWithSound.success('تم جلب الموقع بنجاح ✅ — سيظهر على خريطة المرضى');
            },
            (error) => {
                console.error('GPS error:', error);
                toastWithSound.error('فشل في الوصول للموقع. تأكد من تفعيل الصلاحية.');
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 relative" dir="rtl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-blue-100/50 dark:from-blue-950/20 dark:via-background/50 dark:to-blue-900/20 -z-10 rounded-3xl" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-1 gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">الإعدادات</h2>
                    <p className="text-sm text-blue-600/80 font-medium">إعدادات العيادة والهوية البصرية</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                    <Save className="h-4 w-4" />
                    {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
            </div>

            {/* Visual Branding Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="lg:col-span-2 p-4 sm:p-6 border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[1.5rem] sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">الهوية البصرية</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="clinic_name" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">اسم العيادة</Label>
                                <Input
                                    id="clinic_name"
                                    value={settings.clinic_name}
                                    onChange={(e) => updateSetting('clinic_name', e.target.value)}
                                    placeholder="مثلاً: عيادة الأمل"
                                    className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-right"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clinic_description" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">وصف العيادة (المجال)</Label>
                                <Input
                                    id="clinic_description"
                                    value={settings.clinic_description}
                                    onChange={(e) => updateSetting('clinic_description', e.target.value)}
                                    placeholder="مثلاً: طب الأسنان وصحة الفم"
                                    className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-right"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-blue-100 dark:border-blue-800/50">
                            <Label className="block mb-3 text-blue-900 dark:text-blue-100 font-semibold text-right w-full">شعار العيادة</Label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-center sm:text-right">
                                <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/20 overflow-hidden relative group/img shadow-inner">
                                    {settings.clinic_logo ? (
                                        <img src={settings.clinic_logo.startsWith('http') ? settings.clinic_logo : `${BASE_URL}${settings.clinic_logo}`} alt="Logo Preview" className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                    ) : (
                                        <Building2 className="h-10 w-10 text-blue-400/50" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto gap-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        <Upload className="h-4 w-4" />
                                        رفع شعار جديد
                                    </Button>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground mr-1">يفضل أن يكون الشعار بصيغة PNG وبخلفية شفافة</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <ImageIcon className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 w-full text-right">
                        <h3 className="text-lg font-bold mb-4 flex items-center justify-start gap-2 flex-row-reverse">
                            نصيحة احترافية
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white] mr-2" />
                        </h3>
                        <p className="text-sm text-blue-100 leading-relaxed font-medium">
                            تخصيص اسم وشعار عيادتك يعزز من ثقة المرضى ويجعل النظام يبدو كجزء متكامل من علامتك التجارية. سيتغير هذا الشعار في القائمة الجانبية وفي كافة التقارير الصادرة عن النظام.
                        </p>
                    </div>
                </Card>
            </div>

            {/* Professional Divider */}
            <div className="w-full flex items-center justify-center gap-4 my-4 opacity-60">
                <div className="h-px bg-gradient-to-l from-transparent via-orange-500/50 to-transparent flex-1" />
                <div className="h-1 w-1 rounded-full bg-orange-500/50" />
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent flex-1" />
            </div>

            {/* Clinic Information */}
            <Card className="p-4 sm:p-6 border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[1.5rem] sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                        <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">معلومات التواصل</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">رقم الهاتف الرسمي</Label>
                        <Input
                            id="phone"
                            value={settings.phone}
                            onChange={(e) => updateSetting('phone', e.target.value)}
                            placeholder="0791234567"
                            dir="ltr"
                            className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-left"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergency_phone" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">رقم للطوارئ (اختياري)</Label>
                        <Input
                            id="emergency_phone"
                            value={settings.emergency_phone}
                            onChange={(e) => updateSetting('emergency_phone', e.target.value)}
                            placeholder="0791234567"
                            dir="ltr"
                            className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-left"
                        />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="address" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">العنوان الفعلي</Label>
                        <Input
                            id="address"
                            value={settings.address}
                            onChange={(e) => updateSetting('address', e.target.value)}
                            placeholder="عمان، شارع المدينة المنورة..."
                            className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-right"
                        />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="location_url" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">رابط الموقع على الخريطة (Google Maps)</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                id="location_url"
                                value={settings.location_url || ''}
                                onChange={(e) => updateSetting('location_url', e.target.value)}
                                placeholder="https://maps.google.com/..."
                                dir="ltr"
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-left flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGetCurrentLocation}
                                className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-sm shrink-0 h-11"
                            >
                                <MapPin className="h-4 w-4 ml-2" />
                                تحديد موقعي 📍
                            </Button>
                        </div>
                    </div>

                    {/* ── lat/lng ── */}
                    <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                        <div className="space-y-2">
                            <Label htmlFor="lat" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block flex items-center gap-1">
                                🌐 خط العرض (Latitude)
                            </Label>
                            <Input
                                id="lat"
                                value={settings.lat || ''}
                                onChange={(e) => updateSetting('lat', e.target.value)}
                                placeholder="31.9539"
                                dir="ltr"
                                type="number"
                                step="any"
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lng" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">
                                🌐 خط الطول (Longitude)
                            </Label>
                            <Input
                                id="lng"
                                value={settings.lng || ''}
                                onChange={(e) => updateSetting('lng', e.target.value)}
                                placeholder="35.9106"
                                dir="ltr"
                                type="number"
                                step="any"
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all"
                            />
                        </div>
                        <p className="col-span-2 text-xs text-blue-600/70 font-medium bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                            💡 اضغط <strong>"تحديد موقعي"</strong> بالأعلى لملء الإحداثيات تلقائياً — أو أدخلها يدوياً من Google Maps
                        </p>
                    </div>
                </div>
            </Card>

            {/* Professional Divider */}
            <div className="w-full flex items-center justify-center gap-4 my-4 opacity-60">
                <div className="h-px bg-gradient-to-l from-transparent via-orange-500/50 to-transparent flex-1" />
                <div className="h-1 w-1 rounded-full bg-orange-500/50" />
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent flex-1" />
            </div>

            {/* Working Hours & Appointments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card className="p-4 sm:p-6 border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[1.5rem] sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">ساعات العمل</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="working_hours_start" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">بداية الدوام</Label>
                            <Input
                                id="working_hours_start"
                                type="time"
                                value={settings.working_hours_start}
                                onChange={(e) => updateSetting('working_hours_start', e.target.value)}
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="working_hours_end" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">نهاية الدوام</Label>
                            <Input
                                id="working_hours_end"
                                type="time"
                                value={settings.working_hours_end}
                                onChange={(e) => updateSetting('working_hours_end', e.target.value)}
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-center"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6 border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[1.5rem] sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">إعدادات المواعيد</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="appointment_duration" className="text-blue-900 dark:text-blue-100 font-semibold text-right w-full block">مدة الموعد (دقيقة)</Label>
                            <Input
                                id="appointment_duration"
                                type="number"
                                value={settings.appointment_duration}
                                onChange={(e) => updateSetting('appointment_duration', parseInt(e.target.value))}
                                className="bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11 transition-all text-center"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                            <Label htmlFor="reminder_enabled" className="text-blue-900 dark:text-blue-100 font-semibold cursor-pointer">تفعيل التذكير عبر (WhatsApp)</Label>
                            <Switch
                                id="reminder_enabled"
                                checked={settings.reminder_enabled}
                                onCheckedChange={(checked) => updateSetting('reminder_enabled', checked)}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Auto-Reply Settings */}
            <Card className="p-4 sm:p-6 border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-white/60 to-blue-50/60 dark:from-black/60 dark:to-blue-900/20">
                <div className="flex flex-row items-center gap-4">
                    <div className="p-3 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">الموظف الآلي الذكي</h3>
                        <p className="text-[10px] sm:text-sm text-blue-600/80 font-medium line-clamp-1">تفعيل الرد الآلي وحجز المواعيد عبر واتساب</p>
                    </div>
                    <Switch
                        id="auto_reply_enabled"
                        checked={settings.auto_reply_enabled}
                        onCheckedChange={(checked) => updateSetting('auto_reply_enabled', checked)}
                        className="data-[state=checked]:bg-blue-600 scale-100 sm:scale-110"
                    />
                </div>
            </Card>

            {/* Save Button (Bottom) */}
            <div className="flex justify-center sm:justify-start pt-6">
                <Button onClick={handleSave} disabled={loading} size="lg" className="w-full sm:w-auto gap-2 px-10 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 text-lg font-bold">
                    <Save className="h-5 w-5" />
                    {loading ? 'جاري الحفظ...' : 'حفظ كافة الإعدادات'}
                </Button>
            </div>
        </div>
    );
}
