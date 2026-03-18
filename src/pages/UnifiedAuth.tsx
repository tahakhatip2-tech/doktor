import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toastWithSound } from '@/lib/toast-with-sound';
import { Loader2, Stethoscope, Users, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ─── Validation Schemas ─────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

const doctorRegisterSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string()
        .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    phone: z.string().regex(/^(\+962|00962|962|0)?7[789]\d{7}$/, 'رقم الهاتف يجب أن يكون رقم أردني صحيح (مثال: 0791234567)'),
    name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
    path: ['confirmPassword'],
});

const patientRegisterSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صحيح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    phone: z.string().regex(/^(\+962|00962|962|0)?7[789]\d{7}$/, 'رقم الهاتف يجب أن يكون رقم أردني صحيح'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
    path: ['confirmPassword'],
});

// ─── Types ───────────────────────────────────────────────────────────────────
type UserRole = 'doctor' | 'patient' | null;

// ─── Component ───────────────────────────────────────────────────────────────
const UnifiedAuth = () => {
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, signUp, user, loading } = useAuth();
    const navigate = useNavigate();

    // إعادة التوجيه إذا كان مسجلاً دخوله
    useEffect(() => {
        if (!loading && user) {
            navigate("/");
        }
    }, [user, loading, navigate]);

    // التحقق من جلسة المريض
    useEffect(() => {
        const patientToken = localStorage.getItem('patient_token');
        if (patientToken && !loading) {
            navigate('/patient/dashboard');
        }
    }, [navigate, loading]);

    // ─── Doctor Auth ─────────────────────────────────────────────────────────
    const handleDoctorAuth = async () => {
        try {
            if (isLogin) {
                const validation = loginSchema.safeParse({ email, password });
                if (!validation.success) {
                    toastWithSound.error(validation.error.errors[0].message);
                    return false;
                }

                const { error } = await signIn(email, password);
                if (error) {
                    if (error.includes("Invalid credentials") || error.includes("401")) {
                        toastWithSound.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
                    } else {
                        toastWithSound.error(error);
                    }
                    return false;
                }

                toastWithSound.success("مرحباً دكتور! تم تسجيل الدخول بنجاح");
                navigate("/");
                return true;
            } else {
                const validation = doctorRegisterSchema.safeParse({
                    email, password, confirmPassword, phone, name: fullName
                });

                if (!validation.success) {
                    toastWithSound.error(validation.error.errors[0].message);
                    return false;
                }

                const { error } = await signUp(email, password, confirmPassword, fullName, phone);
                if (error) {
                    if (error.includes("already exists") || error.includes("409") || error.includes("مستخدم")) {
                        toastWithSound.error("هذا البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً");
                    } else {
                        toastWithSound.error(error);
                    }
                    return false;
                }

                localStorage.setItem('isNewUser', 'true');
                toastWithSound.success("مرحباً دكتور! تم إنشاء الحساب بنجاح");
                navigate("/");
                return true;
            }
        } catch (error) {
            toastWithSound.error("حدث خطأ غير متوقع");
            return false;
        }
    };

    // ─── Patient Auth ─────────────────────────────────────────────────────────
    const handlePatientAuth = async () => {
        try {
            if (isLogin) {
                const validation = loginSchema.safeParse({ email, password });
                if (!validation.success) {
                    toastWithSound.error(validation.error.errors[0].message);
                    return false;
                }

                const response = await axios.post(`${API_URL}/patient/auth/login`, {
                    email,
                    password,
                }, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });

                localStorage.setItem('patient_token', response.data.token);
                localStorage.setItem('patient_user', JSON.stringify(response.data.patient));

                toastWithSound.success("مرحباً بعودتك! تم تسجيل الدخول بنجاح");
                navigate('/patient/dashboard');
                return true;
            } else {
                const validation = patientRegisterSchema.safeParse({
                    email, password, confirmPassword, fullName, phone
                });

                if (!validation.success) {
                    toastWithSound.error(validation.error.errors[0].message);
                    return false;
                }

                const response = await axios.post(`${API_URL}/patient/auth/register`, {
                    email,
                    password,
                    fullName,
                    phone,
                }, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });

                localStorage.setItem('patient_token', response.data.token);
                localStorage.setItem('patient_user', JSON.stringify(response.data.patient));

                toastWithSound.success("مرحباً بك! تم إنشاء الحساب بنجاح");
                navigate('/patient/dashboard');
                return true;
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                toastWithSound.error(error.response.data.message);
            } else {
                toastWithSound.error("حدث خطأ في تسجيل الدخول");
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (selectedRole === 'doctor') {
                await handleDoctorAuth();
            } else if (selectedRole === 'patient') {
                await handlePatientAuth();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setPhone("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsLogin(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // ─── Colors by role ──────────────────────────────────────────────────────
    const isDoctor = selectedRole === 'doctor';
    const borderColor = isDoctor ? 'border-blue-500/50' : 'border-orange-500/50';
    const focusBorder = isDoctor ? 'focus:border-blue-400' : 'focus:border-orange-400';
    const labelColor = isDoctor ? 'text-blue-200/80' : 'text-orange-200/80';
    const btnBorder = isDoctor
        ? 'border-blue-500 hover:bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
        : 'border-orange-500 hover:bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]';
    const toggleColor = isDoctor
        ? 'text-blue-300 border-blue-500/30 hover:border-blue-400'
        : 'text-orange-300 border-orange-500/30 hover:border-orange-400';

    const inputClass = `!bg-transparent border ${borderColor} ${focusBorder} focus:ring-0 text-white placeholder:text-white/20 h-11 text-sm transition-all font-mono text-left`;

    return (
        <div className="min-h-screen bg-background flex flex-col relative" dir="rtl">
            <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
            -webkit-background-clip: text;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
            box-shadow: inset 0 0 20px 20px transparent !important;
        }
        ::selection {
          background-color: rgba(249, 115, 22, 0.3);
          color: white;
        }
      `}</style>

            {/* Animated Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 transform scale-105"
                style={{ backgroundImage: 'url(/doktor-jo-auth-v2.png)' }}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full px-4 relative z-10 overflow-y-auto py-2">
                <AnimatePresence mode="wait">
                    {!selectedRole ? (
                        /* ── شاشة اختيار الدور ── */
                        <motion.div
                            key="role-selection"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-lg mx-auto flex flex-col items-center justify-center h-full min-h-[90vh]"
                        >
                            <Card className="w-full p-5 md:p-8 border border-white/10 bg-black/70 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-3xl">
                                {/* Glow effects inside the modal */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-1/2 bg-gradient-to-b from-blue-500/10 via-orange-500/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex flex-col items-center gap-3 mb-5 relative z-10">
                                    <motion.div
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="relative group/logo"
                                    >
                                        <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                        <img
                                            src="/hakeem-logo.png"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                                            alt="Doctor Jo Logo"
                                            className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-full drop-shadow-2xl relative z-10 border-[3px] border-white/20 bg-blue-950/40"
                                        />
                                    </motion.div>

                                    <div className="text-center space-y-1">
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent drop-shadow-sm">
                                            Doctor Jo
                                        </h1>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 flex items-center justify-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-orange-400/80" />
                                            نظام إدارة العيادات الذكي
                                            <Sparkles className="w-3.5 h-3.5 text-orange-400/80" />
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <div className="text-center mb-3">
                                        <h3 className="text-white/80 font-bold text-xs md:text-sm">أرجو تحديد بوابة الدخول الخاصة بك</h3>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {/* Doctor Button */}
                                        <Button
                                            onClick={() => handleRoleSelect('doctor')}
                                            variant="outline"
                                            className="h-14 md:h-16 w-full relative overflow-hidden group bg-blue-950/20 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/40 transition-all duration-300 rounded-2xl shadow-lg"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-500/10 to-blue-600/0 group-hover:translate-x-full duration-1000 transition-transform -translate-x-full"></div>
                                            <div className="flex items-center justify-between w-full px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-inner border border-blue-500/20">
                                                        <Stethoscope className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-base font-bold text-white tracking-wide group-hover:text-blue-200 transition-colors">بوابة الأطباء</span>
                                                        <span className="block text-[10px] text-blue-300/60 font-medium">إدارة النظام والمواعيد</span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-blue-400 group-hover:-translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </Button>

                                        {/* Patient Button */}
                                        <Button
                                            onClick={() => handleRoleSelect('patient')}
                                            variant="outline"
                                            className="h-14 md:h-16 w-full relative overflow-hidden group bg-orange-950/20 border border-orange-500/30 hover:border-orange-400 hover:bg-orange-900/40 transition-all duration-300 rounded-2xl shadow-lg"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-500/10 to-orange-600/0 group-hover:translate-x-full duration-1000 transition-transform -translate-x-full"></div>
                                            <div className="flex items-center justify-between w-full px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-inner border border-orange-500/20">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-base font-bold text-white tracking-wide group-hover:text-orange-200 transition-colors">بوابة المرضى</span>
                                                        <span className="block text-[10px] text-orange-300/60 font-medium">حجز ومتابعة المواعيد</span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-orange-400 group-hover:-translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {/* Vision & Mission Section */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 md:mt-6 text-center px-4 max-w-lg mx-auto"
                            >
                                <div className="inline-flex items-center justify-center gap-2 mb-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                                    <Sparkles className="w-3 h-3 text-orange-400" />
                                    <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-blue-300 to-orange-300 bg-clip-text text-transparent">رؤيتنا للمستقبل</span>
                                    <Sparkles className="w-3 h-3 text-blue-400" />
                                </div>
                                <p className="text-white/70 leading-relaxed font-medium text-[11px] md:text-sm drop-shadow-sm">
                                    نسعى في <span className="text-orange-400 font-bold">Doctor Jo</span> إلى تنظيم القطاع الصحي الخاص وتطوير طرق العلاج والمتابعة للوصول إلى نظام صحي عالمي.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-4 text-center space-y-1"
                            >
                                <p className="text-[10px] text-white/40 font-medium">تم التطوير بكل شغف بواسطة الخطيب للبرمجيات</p>
                                <p className="text-[10px] text-white/30 font-mono font-bold uppercase tracking-widest">Doctor Jo • Version 2.1</p>
                            </motion.div>
                        </motion.div>
                    ) : (
                        /* ── نموذج الدخول / التسجيل ── */
                        <motion.div
                            key="auth-form"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-md"
                        >
                            <Card className={`w-full p-6 border ${isDoctor ? 'border-blue-500/30 bg-blue-950/80' : 'border-orange-500/30 bg-orange-950/80'} shadow-2xl relative overflow-hidden`}>

                                {/* Glow */}
                                <div className={`absolute -top-20 -right-20 w-40 h-40 ${isDoctor ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-full blur-3xl`}></div>
                                <div className={`absolute -bottom-20 -left-20 w-40 h-40 ${isDoctor ? 'bg-orange-500/10' : 'bg-blue-500/10'} rounded-full blur-3xl`}></div>

                                {/* Back Button */}
                                <button
                                    onClick={() => setSelectedRole(null)}
                                    className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors z-20"
                                >
                                    <ArrowRight className="w-6 h-6 rotate-180" />
                                </button>

                                {/* Icon & Title */}
                                <div className="flex flex-col items-center gap-3 mb-5 relative z-10">
                                    <div className={`w-14 h-14 rounded-full ${isDoctor ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-orange-500 to-orange-700'} flex items-center justify-center shadow-2xl`}>
                                        {isDoctor ? <Stethoscope className="w-7 h-7 text-white" /> : <Users className="w-7 h-7 text-white" />}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h2 className="text-xl font-black text-white">
                                            {isDoctor ? 'بوابة الأطباء' : 'بوابة المرضى'}
                                        </h2>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${isDoctor ? 'text-blue-300/80' : 'text-orange-300/80'}`}>
                                            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                                        </p>
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-3 relative z-10">

                                    {/* حقول التسجيل فقط */}
                                    {!isLogin && (
                                        <>
                                            {/* الاسم */}
                                            <div className="space-y-1">
                                                <Label className={`${labelColor} text-xs font-bold uppercase tracking-wide`}>
                                                    {isDoctor ? 'اسم الطبيب' : 'الاسم الكامل'}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder={isDoctor ? 'د. أحمد محمد' : 'أدخل اسمك الكامل'}
                                                    className={`${inputClass} text-right`}
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* رقم الهاتف */}
                                    {!isLogin && (
                                        <div className="space-y-1">
                                            <Label className={`${labelColor} text-xs font-bold uppercase tracking-wide`}>
                                                رقم الهاتف الأردني
                                            </Label>
                                            <Input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="0791234567"
                                                className={inputClass}
                                                required={!isLogin}
                                                dir="ltr"
                                            />
                                        </div>
                                    )}

                                    {/* البريد الإلكتروني */}
                                    <div className="space-y-1">
                                        <Label className={`${labelColor} text-xs font-bold uppercase tracking-wide`}>
                                            البريد الإلكتروني
                                        </Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className={inputClass}
                                            required
                                            dir="ltr"
                                        />
                                    </div>

                                    {/* كلمة المرور */}
                                    <div className="space-y-1">
                                        <Label className={`${labelColor} text-xs font-bold uppercase tracking-wide`}>
                                            كلمة المرور
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className={`${inputClass} pr-10`}
                                                required
                                                dir="ltr"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {!isLogin && (
                                            <p className="text-xs text-white/30 mt-1">
                                                {isDoctor ? 'يجب أن تحتوي على حرف كبير وحرف صغير ورقم (8 أحرف كحد أدنى)' : '6 أحرف كحد أدنى'}
                                            </p>
                                        )}
                                    </div>

                                    {/* تأكيد كلمة المرور – عند التسجيل فقط */}
                                    {!isLogin && (
                                        <div className="space-y-1">
                                            <Label className={`${labelColor} text-xs font-bold uppercase tracking-wide`}>
                                                تأكيد كلمة المرور
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className={`${inputClass} pr-10 ${confirmPassword && confirmPassword !== password ? 'border-red-500/70' : confirmPassword && confirmPassword === password ? 'border-green-500/70' : ''}`}
                                                    required={!isLogin}
                                                    dir="ltr"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {confirmPassword && confirmPassword !== password && (
                                                <p className="text-xs text-red-400 mt-1">كلمتا المرور غير متطابقتين</p>
                                            )}
                                            {confirmPassword && confirmPassword === password && (
                                                <p className="text-xs text-green-400 mt-1">✓ كلمتا المرور متطابقتان</p>
                                            )}
                                        </div>
                                    )}

                                    {/* زر الإرسال */}
                                    <Button
                                        type="submit"
                                        className={`w-full mt-2 bg-transparent border-2 ${btnBorder} font-bold h-12 transition-all duration-300 text-sm uppercase tracking-wider relative overflow-hidden group/btn`}
                                        disabled={isLoading}
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="animate-pulse">جاري المعالجة...</span>
                                            </div>
                                        ) : (
                                            isLogin ? "دخول للنظام" : "إنشاء حساب"
                                        )}
                                    </Button>
                                </form>

                                {/* Toggle Login/Register */}
                                <div className="text-center mt-6 relative z-10">
                                    <button
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setPassword("");
                                            setConfirmPassword("");
                                        }}
                                        className={`text-xs ${toggleColor} hover:text-white transition-colors font-medium border-b border-dashed pb-0.5`}
                                    >
                                        {isLogin
                                            ? "مستخدم جديد؟ إنشاء حساب"
                                            : "لديك حساب؟ تسجيل الدخول"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UnifiedAuth;
