import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';
import {
    User, Phone, MapPin, Clock, Camera, Loader2, Save, Building2, Mail, Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const getAvatarSrc = (avatar?: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('data:image') || avatar.startsWith('blob:')) return avatar;
    return `${API_ORIGIN}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
};

const compressImage = (file: File, maxSize = 512, quality = 0.85): Promise<File> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('فشل قراءة الملف'));
        reader.onload = (ev) => {
            const img = new Image();
            img.onerror = () => reject(new Error('فشل تحميل الصورة'));
            img.onload = () => {
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('فشل معالجة الصورة'));
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('فشل ضغط الصورة'));
                        const safeName = (file.name || 'logo').replace(/\.[^.]+$/, '') + '.jpg';
                        resolve(new File([blob], safeName, { type: 'image/jpeg' }));
                    },
                    'image/jpeg',
                    quality,
                );
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    });

export default function PharmacyProfile() {
    const { pharmacy, loading, setPharmacy, refresh } = usePharmacyAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [clinicPhone, setClinicPhone] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');
    const [workingHours, setWorkingHours] = useState('');
    const [avatar, setAvatar] = useState<string>('');
    const [originalAvatar, setOriginalAvatar] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!pharmacy) return;
        setName(pharmacy.name || '');
        setPhone(pharmacy.phone || '');
        setClinicPhone(pharmacy.clinic_phone || '');
        setClinicAddress(pharmacy.clinic_address || '');
        setWorkingHours(pharmacy.working_hours || '');
        const incoming = pharmacy.avatar || (pharmacy as any).clinic_logo || '';
        setAvatar(incoming);
        setOriginalAvatar(incoming);
    }, [pharmacy]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 text-teal-500 animate-spin mb-4" />
                <p className="text-slate-500">جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (!pharmacy) return null;

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'الرجاء اختيار صورة فقط' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ variant: 'destructive', title: 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)' });
            return;
        }

        const token = localStorage.getItem('pharmacy_token');
        if (!token) {
            toast({
                variant: 'destructive',
                title: 'انتهت الجلسة',
                description: 'يرجى تسجيل الدخول مجدداً',
            });
            return;
        }

        setUploading(true);
        try {
            const compressed = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressed);

            const res = await axios.post(`${API_URL}/pharmacy/upload-logo`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = (res.data || {}) as { avatar?: string; url?: string; pharmacy?: any };
            const url = data.avatar || data.url;
            if (!url) throw new Error('استجابة الخادم لم تتضمن رابط الصورة');

            setAvatar(url);
            setOriginalAvatar(url);

            const merged = {
                ...pharmacy,
                ...(data.pharmacy && typeof data.pharmacy === 'object' ? data.pharmacy : {}),
                avatar: url,
            };
            setPharmacy(merged);

            toast({ title: '✅ تم رفع الشعار بنجاح' });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string; code?: string };
            let description = 'فشل تحميل الصورة';
            if (axiosErr?.response?.data?.message) {
                const msg = axiosErr.response.data.message;
                description = Array.isArray(msg) ? msg.join('، ') : msg;
            } else if (axiosErr?.code === 'ERR_NETWORK') {
                description = 'تعذّر الاتصال بالخادم — تحقّق من الإنترنت';
            } else if (axiosErr?.message) {
                description = axiosErr.message;
            }
            console.error('[PharmacyProfile] Upload failed', err, { description });
            toast({ variant: 'destructive', title: 'فشل رفع الشعار', description });
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleRemoveAvatar = () => {
        setAvatar('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ variant: 'destructive', title: 'اسم الصيدلية مطلوب' });
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('pharmacy_token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز الدخول — يرجى تسجيل الدخول مجدداً');
            }
            const payload: Record<string, string | null> = {
                name: name.trim(),
                phone: phone.trim() || null,
                clinic_phone: clinicPhone.trim() || null,
                clinic_address: clinicAddress.trim() || null,
                working_hours: workingHours.trim() || null,
            };

            // Only persist the avatar when it's an URL/path (uploaded). Never send base64.
            if (avatar && !avatar.startsWith('data:')) {
                payload.avatar = avatar;
            } else if (!avatar && originalAvatar) {
                payload.avatar = null;
            }

            console.debug('[PharmacyProfile] Saving settings', payload);
            const res = await axios.post(`${API_URL}/pharmacy/settings`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            console.debug('[PharmacyProfile] Save response', res.data);

            const responseData = (res.data && typeof res.data === 'object' ? res.data : {}) as Record<string, unknown>;
            const responseAvatar = responseData.avatar !== undefined && responseData.avatar !== null
                ? String(responseData.avatar)
                : (typeof payload.avatar === 'string' ? payload.avatar : '');

            const updated: any = {
                ...pharmacy,
                ...responseData,
                avatar: responseAvatar,
            };

            try {
                setPharmacy(updated);
                setOriginalAvatar(responseAvatar);
                refresh?.().catch(() => undefined);
            } catch (mergeErr) {
                console.error('[PharmacyProfile] Failed to merge pharmacy state', mergeErr, { updated });
                throw new Error('فشل تحديث البيانات المحلية بعد الحفظ في الخادم');
            }
            toast({ title: '✅ تم تحديث البيانات بنجاح' });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string; code?: string };
            let description = 'حدث خطأ أثناء حفظ البيانات';
            if (axiosErr?.response?.data?.message) {
                const msg = axiosErr.response.data.message;
                description = Array.isArray(msg) ? msg.join('، ') : msg;
            } else if (axiosErr?.code === 'ERR_NETWORK') {
                description = 'تعذّر الاتصال بالخادم — تحقّق من الإنترنت';
            } else if (axiosErr?.message) {
                description = axiosErr.message;
            }
            console.error('[PharmacyProfile] Save failed', err, { description });
            toast({
                variant: 'destructive',
                title: 'فشل التحديث',
                description,
            });
        } finally {
            setSaving(false);
        }
    };

    const dirty = name !== (pharmacy.name || '')
        || phone !== (pharmacy.phone || '')
        || clinicPhone !== (pharmacy.clinic_phone || '')
        || clinicAddress !== (pharmacy.clinic_address || '')
        || workingHours !== (pharmacy.working_hours || '')
        || avatar !== originalAvatar;

    const displayName = pharmacy.clinic_name || pharmacy.name || 'الصيدلية';

    return (
        <div className="space-y-6 pb-24 max-w-3xl mx-auto" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-blue-900">حسابي</h1>
                    <p className="text-sm text-blue-600/70 font-medium">إدارة بيانات وشعار الصيدلية</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── Logo / Avatar Card ── */}
                <Card className="shadow-sm border-teal-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Camera className="h-5 w-5 text-teal-600" />
                            شعار الصيدلية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-teal-600 to-teal-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
                                <div className="relative h-28 w-28 rounded-full bg-white p-1 border-2 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                    {avatar ? (
                                        <img src={getAvatarSrc(avatar)} alt="logo" className="h-full w-full object-cover rounded-full" />
                                    ) : (
                                        <div className="h-full w-full rounded-full bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center text-white">
                                            <Pill className="h-12 w-12" />
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                            <Loader2 className="h-7 w-7 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="border-teal-200 text-teal-700 hover:bg-teal-50 font-bold rounded-xl"
                                    >
                                        <Camera className="h-4 w-4 ml-2" />
                                        {avatar ? 'تغيير الشعار' : 'رفع شعار'}
                                    </Button>
                                    {avatar && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleRemoveAvatar}
                                            className="text-red-600 hover:bg-red-50 font-bold rounded-xl"
                                        >
                                            إزالة الشعار
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    PNG أو JPG أو WEBP، حتى 5 ميجا. سيتم ضغط الصورة تلقائياً للحفاظ على سرعة التطبيق.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Basic Info Card ── */}
                <Card className="shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            بيانات الصيدلية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700">اسم الصيدلية</Label>
                            <div className="relative">
                                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="pr-10 h-11 rounded-xl border-slate-200"
                                    placeholder="صيدلية النور"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-slate-700">البريد الإلكتروني</Label>
                                <div className="relative">
                                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        value={pharmacy.email || ''}
                                        readOnly
                                        dir="ltr"
                                        className="pr-10 h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">لا يمكن تغيير البريد الإلكتروني</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-bold text-slate-700">رقم الجوال</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        dir="ltr"
                                        className="pr-10 h-11 rounded-xl border-slate-200"
                                        placeholder="07XXXXXXXXX"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Contact + Hours Card ── */}
                <Card className="shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="h-5 w-5 text-orange-500" />
                            معلومات التواصل
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="clinicPhone" className="text-sm font-bold text-slate-700">هاتف الصيدلية</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="clinicPhone"
                                        value={clinicPhone}
                                        onChange={e => setClinicPhone(e.target.value)}
                                        dir="ltr"
                                        className="pr-10 h-11 rounded-xl border-slate-200"
                                        placeholder="06XXXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="workingHours" className="text-sm font-bold text-slate-700">ساعات العمل</Label>
                                <div className="relative">
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="workingHours"
                                        value={workingHours}
                                        onChange={e => setWorkingHours(e.target.value)}
                                        className="pr-10 h-11 rounded-xl border-slate-200"
                                        placeholder="9 صباحاً - 11 مساءً"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clinicAddress" className="text-sm font-bold text-slate-700">العنوان</Label>
                            <div className="relative">
                                <MapPin className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="clinicAddress"
                                    value={clinicAddress}
                                    onChange={e => setClinicAddress(e.target.value)}
                                    className="pr-10 h-11 rounded-xl border-slate-200"
                                    placeholder="شارف، عمان"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Action Bar ── */}
                <div className="flex items-center gap-3 sticky bottom-20 z-30 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-3 shadow-lg">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/pharmacy/dashboard')}
                        className="rounded-xl font-bold"
                    >
                        إلغاء
                    </Button>
                    <div className="flex-1" />
                    <Button
                        type="submit"
                        disabled={saving || !dirty}
                        className={cn(
                            "rounded-xl font-bold gap-2 px-6 shadow-md",
                            dirty
                                ? "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                حفظ التغييرات
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
