import { useState, useEffect } from "react";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toastWithSound } from "@/lib/toast-with-sound";
import { Loader2, User, Phone, Mail, FileText, Droplets, AlertTriangle, AlertCircle, HeartPulse, MapPin, Calendar, Check } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/lib/api";

export default function PatientProfile() {
    const { patient, loading, token } = usePatientAuth(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
            const response = await axios.put(`${API_URL}/patient/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local storage
            const updatedPatient = response.data;
            localStorage.setItem('patient_user', JSON.stringify(updatedPatient));

            toastWithSound.success("تم تحديث الملف الشخصي بنجاح");
            setIsEditing(false);

            // Reload page to reflect changes in layout and context if needed
            window.location.reload();
        } catch (error: any) {
            console.error("Profile update error:", error);
            toastWithSound.error(error.response?.data?.message || "حدث خطأ أثناء تحديث الملف الشخصي");
        } finally {
            setIsSaving(false);
        }
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
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-full blur-sm opacity-30" />
                        <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white overflow-hidden shadow-xl border-4 border-white">
                            <span className="text-3xl font-black">{patient.fullName?.charAt(0) || 'م'}</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                            الملف الشخصي
                        </h1>
                        <p className="text-sm font-bold text-slate-500 mt-1">
                            إدارة بياناتك الشخصية والطبية لمتابعة أفضل
                        </p>
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
