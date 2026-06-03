import { useState, useEffect, useRef, useMemo } from "react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toastWithSound } from "@/lib/toast-with-sound";
import { Loader2, User, Phone, Mail, FileText, Droplets, AlertTriangle, AlertCircle, HeartPulse, MapPin, Calendar, Check, Camera, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

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

    const [initialData, setInitialData] = useState(formData);

    useEffect(() => {
        if (patient) {
            const fetchedData = {
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
            };
            setFormData(fetchedData);
            setInitialData(fetchedData);
            setAvatarUrl(patient.avatar || "");
        }
    }, [patient]);

    const isDirty = useMemo(() => {
        return Object.keys(formData).some(
            (key) => formData[key as keyof typeof formData] !== initialData[key as keyof typeof initialData]
        );
    }, [formData, initialData]);

    if (loading || !patient) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
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

            const updatedPatient = response.data;
            localStorage.setItem('patient_user', JSON.stringify(updatedPatient));
            
            setInitialData(formData);
            toastWithSound.success("تم تحديث الملف الشخصي بنجاح");
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
        if (!token) return;

        setIsUploadingAvatar(true);
        try {
            const compressed = await compressImage(file);
            const fd = new FormData();
            fd.append("file", compressed);

            const res = await axios.post(`${API_URL}/patient/profile/avatar`, fd, {
                headers: { Authorization: `Bearer ${token}` },
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
                } catch { }
            }
            toastWithSound.success("تم تحديث الصورة الشخصية بنجاح");
            
            // Reload to update headers
            window.location.reload();
        } catch (err: unknown) {
            toastWithSound.error("فشل رفع الصورة");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const inputClasses = "h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 rounded-xl px-4 shadow-sm";
    const labelClasses = "text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ml-1";

    return (
        <div className="max-w-4xl mx-auto py-6 animate-in fade-in zoom-in-95 duration-500" dir="rtl">
            
            {/* Action Bar (Sticky Top or Floating Bottom) */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
                        dir="rtl"
                    >
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-700 p-2 pl-4 pr-6 flex items-center gap-6">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                لديك تغييرات غير محفوظة
                            </span>
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setFormData(initialData)} 
                                    disabled={isSaving}
                                    className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800 font-bold"
                                >
                                    تراجع
                                </Button>
                                <Button 
                                    size="sm"
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Check className="h-4 w-4 ml-1" />}
                                    حفظ التغييرات
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Side: Profile Identity (Sticky) */}
                <div className="md:col-span-4">
                    <Card className="border-0 shadow-xl shadow-blue-900/5 rounded-[2rem] overflow-hidden sticky top-24">
                        <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-800 relative">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        </div>
                        <CardContent className="pt-0 pb-8 px-6 text-center -mt-12 relative z-10">
                            <div className="relative inline-block group mb-4">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative h-28 w-28 mx-auto rounded-full bg-white flex items-center justify-center overflow-hidden shadow-xl border-4 border-white">
                                    {getAvatarSrc(avatarUrl) ? (
                                        <img src={getAvatarSrc(avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-blue-700">{patient.fullName?.charAt(0) || 'م'}</span>
                                    )}
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center text-white hover:bg-orange-600 hover:scale-110 transition-transform active:scale-95 z-20"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>
                            
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-1">
                                {patient.fullName}
                            </h1>
                            <p className="text-sm font-bold text-blue-600 tracking-wide mb-6 bg-blue-50 py-1 px-3 rounded-full inline-block" dir="ltr">
                                {patient.phone}
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-right">
                                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">تاريخ الميلاد</p>
                                    <p className="text-xs font-black text-slate-700" dir="ltr">{formData.dateOfBirth || "—"}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">فصيلة الدم</p>
                                    <p className="text-xs font-black text-red-600" dir="ltr">{formData.bloodType || "—"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Editable Form */}
                <div className="md:col-span-8 space-y-6">
                    
                    {/* section: Personal Info */}
                    <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-50 bg-white flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800">المعلومات الشخصية</h2>
                                <p className="text-xs font-bold text-slate-500">قم بتحديث بياناتك لتسهيل التواصل</p>
                            </div>
                        </div>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/30">
                            <div className="md:col-span-2">
                                <Label className={labelClasses}><User className="h-3 w-3 text-blue-500"/> الاسم الكامل</Label>
                                <Input name="fullName" value={formData.fullName} onChange={handleChange} className={inputClasses} placeholder="اسم المريض الرباعي" />
                            </div>
                            
                            <div>
                                <Label className={labelClasses}><Phone className="h-3 w-3 text-orange-500"/> رقم الهاتف</Label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} dir="ltr" />
                            </div>
                            
                            <div>
                                <Label className={labelClasses}><Mail className="h-3 w-3 text-slate-400"/> البريد الإلكتروني</Label>
                                <Input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} dir="ltr" placeholder="example@mail.com" />
                            </div>

                            <div>
                                <Label className={labelClasses}><Calendar className="h-3 w-3 text-teal-500"/> تاريخ الميلاد</Label>
                                <Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClasses} dir="ltr" />
                            </div>

                            <div>
                                <Label className={labelClasses}><User className="h-3 w-3 text-indigo-500"/> الجنس</Label>
                                <select 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={handleChange as any} 
                                    className={cn(inputClasses, "w-full appearance-none")}
                                >
                                    <option value="">غير محدد</option>
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <Label className={labelClasses}><MapPin className="h-3 w-3 text-red-500"/> عنوان السكن</Label>
                                <Input name="address" value={formData.address} onChange={handleChange} className={inputClasses} placeholder="المدينة، الحي، تفاصيل المنزل..." />
                            </div>
                        </CardContent>
                    </Card>

                    {/* section: Medical Info */}
                    <Card className="border-0 shadow-lg shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                        <div className="px-6 py-5 border-b border-red-50 bg-white flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <HeartPulse className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-800">السجل الطبي الأساسي</h2>
                                <p className="text-xs font-bold text-slate-500">معلومات هامة في حالات الطوارئ</p>
                            </div>
                        </div>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-red-50/10">
                            
                            <div>
                                <Label className={labelClasses}><Droplets className="h-3 w-3 text-red-600"/> فصيلة الدم</Label>
                                <select 
                                    name="bloodType" 
                                    value={formData.bloodType} 
                                    onChange={handleChange as any} 
                                    className={cn(inputClasses, "w-full appearance-none text-red-700 bg-red-50/50 border-red-100 focus:border-red-500 focus:ring-red-500/10")}
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
                            </div>

                            <div>
                                <Label className={labelClasses}><AlertTriangle className="h-3 w-3 text-orange-500"/> هاتف الطوارئ</Label>
                                <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className={inputClasses} dir="ltr" placeholder="رقم شخص مقرب..." />
                            </div>

                            <div className="md:col-span-2">
                                <Label className={labelClasses}><AlertCircle className="h-3 w-3 text-orange-500"/> الحساسية (Allergies)</Label>
                                <textarea 
                                    name="allergies" 
                                    value={formData.allergies} 
                                    onChange={handleChange} 
                                    className={cn(inputClasses, "min-h-[100px] py-3 resize-none")}
                                    placeholder="أدوية، أطعمة، ظروف بيئية..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label className={labelClasses}><FileText className="h-3 w-3 text-blue-500"/> الأمراض المزمنة والتاريخ الطبي</Label>
                                <textarea 
                                    name="chronicDiseases" 
                                    value={formData.chronicDiseases} 
                                    onChange={handleChange} 
                                    className={cn(inputClasses, "min-h-[100px] py-3 resize-none")}
                                    placeholder="السكري، الضغط، عمليات جراحية سابقة..."
                                />
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
