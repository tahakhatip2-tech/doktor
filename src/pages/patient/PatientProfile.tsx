import { useState, useEffect, useRef } from "react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toastWithSound } from "@/lib/toast-with-sound";
import { Loader2, User, Phone, Mail, FileText, Droplets, AlertTriangle, AlertCircle, HeartPulse, MapPin, Calendar, Check, Camera } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/lib/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getAvatarSrc = (avatar?: string) => {
    if (!avatar) return "";
    if (avatar.startsWith("http") || avatar.startsWith("data:image") || avatar.startsWith("blob:")) return avatar;
    return `${API_ORIGIN}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
};

const compressImage = (file: File, maxSize = 512, quality = 0.85): Promise<File> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("فشل قراءة الملف"));
        reader.onload = (ev) => {
            const img = new Image();
            img.onerror = () => reject(new Error("فشل تحميل الصورة"));
            img.onload = () => {
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("فشل معالجة الصورة"));
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("فشل ضغط الصورة"));
                        const safeName = (file.name || "avatar").replace(/\.[^.]+$/, "") + ".jpg";
                        resolve(new File([blob], safeName, { type: "image/jpeg" }));
                    },
                    "image/jpeg",
                    quality,
                );
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    });

export default function PatientProfile() {
    const { patient, loading, token } = usePatientAuth(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        bloodType: "",
        allergies: "",
        chronicDiseases: "",
        emergencyContact: "",
        address: "",
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                fullName: patient.fullName || "",
                phone: patient.phone || "",
                email: patient.email || "",
                dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
                gender: patient.gender || "",
                bloodType: patient.bloodType || "",
                allergies: patient.allergies || "",
                chronicDiseases: patient.chronicDiseases || "",
                emergencyContact: patient.emergencyContact || "",
                address: patient.address || "",
            });
            setAvatarUrl(patient.avatar || "");
        }
    }, [patient]);

    if (loading || !patient) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Clean payload — drop empty optional fields
            const payload: Record<string, string> = {};
            (Object.keys(formData) as Array<keyof typeof formData>).forEach((k) => {
                const v = formData[k];
                if (v) payload[k as string] = v;
            });

            const response = await axios.put(`${API_URL}/patient/profile`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            // Update local storage
            const updatedPatient = response.data;
            localStorage.setItem('patient_user', JSON.stringify(updatedPatient));

            toastWithSound.success("تم تحديث الملف الشخصي بنجاح");
            setIsEditing(false);

            // Reload page to reflect changes in layout and context if needed
            window.location.reload();
        } catch (error: unknown) {
            console.error("Profile update error:", error);
            const err = error as { response?: { data?: { message?: string | string[] } } };
            const errMsg = err?.response?.data?.message;
            toastWithSound.error(Array.isArray(errMsg) ? errMsg[0] : (errMsg || "حدث خطأ أثناء تحديث الملف الشخصي"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toastWithSound.error("الرجاء اختيار صورة فقط");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toastWithSound.error("حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (!token) {
            toastWithSound.error("انتهت الجلسة — يرجى تسجيل الدخول مجدداً");
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const compressed = await compressImage(file);
            const fd = new FormData();
            fd.append("file", compressed);

            const res = await axios.post(`${API_URL}/patient/profile/avatar`, fd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            const data = (res.data || {}) as { avatar?: string; url?: string; patient?: unknown };
            const url = data.avatar || data.url;
            if (!url) throw new Error("استجابة الخادم لم تتضمن رابط الصورة");

            setAvatarUrl(url);

            const stored = localStorage.getItem("patient_user");
            if (stored) {
                try {
                    const parsed: Record<string, unknown> = JSON.parse(stored);
                    parsed.avatar = url;
                    localStorage.setItem("patient_user", JSON.stringify(parsed));
                } catch {
                    /* ignore */
                }
            }

            toastWithSound.success("تم تحديث الصورة الشخصية بنجاح");
        } catch (err: unknown) {
            console.error("Avatar upload error:", err);
            const e = err as { response?: { data?: { message?: string | string[] } }; code?: string; message?: string };
            let description = "فشل رفع الصورة";
            const msg = e?.response?.data?.message;
            if (Array.isArray(msg)) description = msg.join("، ");
            else if (typeof msg === "string") description = msg;
            else if (e?.code === "ERR_NETWORK") description = "تعذّر الاتصال بالخادم — تحقّق من الإنترنت";
            else if (e?.message) description = e.message;
            toastWithSound.error(description);
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerAvatarPicker = () => {
        fileInputRef.current?.click();
    };

    // Helper for rendering form fields
    const renderField = (icon: any, label: string, name: keyof typeof formData, type: string = "text", placeholder: string = "", dir: string = "rtl") => {
        const Icon = icon;
        return (
            <div className="space-y-2 group">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-blue-500" />
                    {label}
                </Label>
                {isEditing ? (
                    <Input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        dir={dir}
                        className="bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-700 h-11"
                    />
                ) : (
                    <div className="h-11 flex items-center px-3 bg-slate-50/50 border border-slate-100 rounded-md font-medium text-slate-700" dir={dir}>
                        {formData[name] || <span className="text-slate-400 font-normal italic">لا يوجد</span>}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500" dir="rtl">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-full blur-sm opacity-30" />
                        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white overflow-hidden shadow-xl border-4 border-white">
                            {getAvatarSrc(avatarUrl) ? (
                                <img
                                    src={getAvatarSrc(avatarUrl)}
                                    alt={patient.fullName || "الصورة الشخصية"}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                />
                            ) : (
                                <span className="text-3xl font-black">{patient.fullName?.charAt(0) || 'م'}</span>
                            )}
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={triggerAvatarPicker}
                            disabled={isUploadingAvatar}
                            className="absolute -bottom-1 -left-1 h-8 w-8 rounded-full bg-white border-2 border-blue-100 shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition disabled:opacity-50"
                            title="تغيير الصورة"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                            الملف الشخصي
                        </h1>
                        <p className="text-sm font-bold text-slate-500 mt-1">
                            إدارة بياناتك الشخصية والطبية لمتابعة أفضل
                        </p>
                        <button
                            type="button"
                            onClick={triggerAvatarPicker}
                            disabled={isUploadingAvatar}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            <Camera className="h-3.5 w-3.5" />
                            {avatarUrl ? "تغيير الصورة" : "إضافة صورة شخصية"}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 h-11"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-11 px-6 shadow-lg shadow-blue-500/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                    <Check className="h-4 w-4 ml-2" />
                                )}
                                حفظ التغييرات
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 font-bold h-11 px-6 shadow-sm"
                        >
                            تحديث البيانات
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Personal Information */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-0 shadow-lg shadow-slate-200/50 relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <User className="w-5 h-5" />
                                </div>
                                المعلومات الشخصية
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {renderField(User, "الاسم الكامل", "fullName")}
                            <div className="grid grid-cols-2 gap-4">
                                {renderField(Calendar, "تاريخ الميلاد", "dateOfBirth", "date", "", "ltr")}
                                <div className="space-y-2 group">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 text-blue-500" />
                                        الجنس
                                    </Label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange as any}
                                            className="w-full flex h-11 w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 text-slate-700"
                                        >
                                            <option value="">اختر الجنس</option>
                                            <option value="male">ذكر</option>
                                            <option value="female">أنثى</option>
                                        </select>
                                    ) : (
                                        <div className="h-11 flex items-center px-3 bg-slate-50/50 border border-slate-100 rounded-md font-medium text-slate-700">
                                            {formData.gender === 'male' ? 'ذكر' : formData.gender === 'female' ? 'أنثى' : <span className="text-slate-400 font-normal italic">لا يوجد</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 2. Contact Information */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-0 shadow-lg shadow-slate-200/50 relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-500" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                                    <Phone className="w-5 h-5" />
                                </div>
                                معلومات الاتصال
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {renderField(Phone, "رقم الهاتف", "phone", "tel", "", "ltr")}
                            {renderField(Mail, "البريد الإلكتروني", "email", "email", "", "ltr")}
                            {renderField(MapPin, "العنوان", "address", "text", "المدينة، الحي، الشارع")}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 3. Medical Information */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
                    <Card className="border-0 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-red-400 to-red-600" />
                        <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-red-50 rounded-lg text-red-500">
                                    <HeartPulse className="w-5 h-5" />
                                </div>
                                السجل الطبي الأساسي
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                                هذه المعلومات تساعد طبيبك في تقديم رعاية أفضل لك
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group relative">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Droplets className="w-3.5 h-3.5 text-red-500" />
                                        فصيلة الدم
                                    </Label>
                                    {isEditing ? (
                                        <select
                                            name="bloodType"
                                            value={formData.bloodType}
                                            onChange={handleChange as any}
                                            className="w-full flex h-11 w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 text-slate-700"
                                            dir="ltr"
                                        >
                                            <option value="">غير محدد</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    ) : (
                                        <div className="h-11 flex items-center px-3 bg-red-50/30 border border-red-100 text-red-700 rounded-md font-bold" dir="ltr">
                                            {formData.bloodType || <span className="text-slate-400 font-normal italic">غير محدد</span>}
                                        </div>
                                    )}
                                </div>
                                {renderField(AlertTriangle, "رقم للطوارئ", "emergencyContact", "tel", "", "ltr")}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                        الحساسية (Allergies)
                                    </Label>
                                    {isEditing ? (
                                        <textarea
                                            name="allergies"
                                            value={formData.allergies}
                                            onChange={handleChange}
                                            placeholder="أدخل أي حساسية تعاني منها (أدوية، أطعمة، الخ)"
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400 text-slate-700 resize-none"
                                        />
                                    ) : (
                                        <div className="min-h-[80px] p-3 bg-slate-50/50 border border-slate-100 rounded-md font-medium text-slate-700 whitespace-pre-wrap">
                                            {formData.allergies || <span className="text-slate-400 font-normal italic">لا توجد حساسية معروفة</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 group">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                                        الأمراض المزمنة
                                    </Label>
                                    {isEditing ? (
                                        <textarea
                                            name="chronicDiseases"
                                            value={formData.chronicDiseases}
                                            onChange={handleChange}
                                            placeholder="أدخل أي أمراض مزمنة (سكري، ضغط، الخ)"
                                            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white/50 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 text-slate-700 resize-none"
                                        />
                                    ) : (
                                        <div className="min-h-[80px] p-3 bg-slate-50/50 border border-slate-100 rounded-md font-medium text-slate-700 whitespace-pre-wrap">
                                            {formData.chronicDiseases || <span className="text-slate-400 font-normal italic">لا توجد أمراض مزمنة</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
