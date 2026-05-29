import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, LogIn, X, Users, Activity, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toastWithSound } from '@/lib/toast-with-sound';
import { useActiveDoctor } from '@/context/ActiveDoctorContext';
import { useClinicContext } from '@/context/ClinicContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function StaffLoginModal() {
    const { showLoginModal, closeLoginModal, setActiveDoctor } = useActiveDoctor();
    const { settings } = useClinicContext();
    
    const [mode, setMode] = useState<'select' | 'login'>('select');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // إعادة تعيين الحالة عند فتح المودال
    useEffect(() => {
        if (showLoginModal) {
            setMode('select');
            setUsername('');
            setPassword('');
        }
    }, [showLoginModal]);

    const handleAdminLogin = () => {
        setActiveDoctor(null); // مسح أي دكتور نشط
        closeLoginModal();
        toastWithSound.success(`مرحباً دكتور، تم تسجيل الدخول كمسؤول`);
    };

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toastWithSound.error('الرجاء إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/clinic-doctors/login`, { username, password });
            setActiveDoctor(res.data);
            closeLoginModal();
            toastWithSound.success(`مرحباً بك، ${res.data.name}`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
            toastWithSound.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!showLoginModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md"
            >
                <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl bg-white">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                                مرحباً بك في النظام
                            </h2>
                            <p className="text-blue-100 text-sm font-medium">
                                {settings?.clinic_name || 'العيادة'}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {mode === 'select' ? (
                                <motion.div
                                    key="select"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-center text-slate-500 font-bold mb-6">
                                        يرجى تحديد صفة الدخول للنظام
                                    </h3>

                                    <Button
                                        onClick={handleAdminLogin}
                                        className="w-full h-14 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 shadow-sm transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-600 text-white rounded-xl">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base">الدخول كصاحب العيادة (Admin)</div>
                                                <div className="text-xs text-blue-500 font-medium">متابعة بحساب الإدارة الرئيسي</div>
                                            </div>
                                        </div>
                                    </Button>

                                    <div className="relative py-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-white text-slate-400 font-bold">أو</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setMode('login')}
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-700 group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-bold">تسجيل دخول موظف / طبيب</div>
                                                <div className="text-xs text-slate-400 font-medium group-hover:text-orange-500/80">حساب مخصص للطاقم الطبي</div>
                                            </div>
                                        </div>
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="flex items-center gap-2 mb-6">
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => setMode('select')}
                                            className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <h3 className="text-slate-800 font-bold">تسجيل دخول الموظفين</h3>
                                    </div>

                                    <form onSubmit={handleStaffLogin} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 ml-1">اسم المستخدم</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    dir="ltr"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="username"
                                                    className="pl-4 pr-10 h-12 rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 text-left"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-600 ml-1">كلمة المرور</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                                    <Lock className="h-5 w-5" />
                                                </div>
                                                <Input
                                                    type="password"
                                                    dir="ltr"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="pl-4 pr-10 h-12 rounded-xl border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 text-left"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base mt-2 shadow-md shadow-orange-500/20"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <LogIn className="w-5 h-5 ml-2" />
                                                    دخول
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
