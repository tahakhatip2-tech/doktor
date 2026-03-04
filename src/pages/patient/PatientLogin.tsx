import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, Lock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientLogin() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ phone: '', password: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/patient/auth/login`, formData);
            localStorage.setItem('patient_token', response.data.token);
            localStorage.setItem('patient_user', JSON.stringify(response.data.patient));
            toast({ title: 'مرحباً بعودتك!', description: 'تم تسجيل الدخول بنجاح' });
            navigate('/patient/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ في تسجيل الدخول',
                description: error.response?.data?.message || 'رقم الهاتف أو كلمة المرور غير صحيحة',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4" dir="rtl">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gradient-primary mb-2">حكيم الأردن</h1>
                    <p className="text-muted-foreground">بوابة المرضى</p>
                </div>

                <Card className="shadow-elevated animate-slide-up">
                    <CardHeader>
                        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
                        <CardDescription>أدخل رقم هاتفك وكلمة المرور</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <div className="relative">
                                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pr-10 text-left"
                                        placeholder="079xx..."
                                        autoComplete="tel"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pr-10 text-left"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gradient-primary text-white shadow-glow"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جاري تسجيل الدخول...</>
                                ) : (
                                    'تسجيل الدخول'
                                )}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground space-y-2 pt-2">
                                <div>
                                    ليس لديك حساب؟{' '}
                                    <Link to="/patient/register" className="text-primary hover:underline font-medium">
                                        إنشاء حساب جديد
                                    </Link>
                                </div>
                                <div>
                                    <Link to="/" className="text-muted-foreground hover:text-primary">
                                        العودة للصفحة الرئيسية
                                    </Link>
                                </div>
                            </div>

                            {/* WhatsApp booking hint */}
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-800 dark:text-green-300 space-y-1">
                                <p className="font-semibold">هل حجزت موعدك عبر الواتساب؟</p>
                                <p>يمكنك الدخول برقم هاتفك كاسم مستخدم وكلمة مرور معاً للمرة الأولى</p>
                                <p className="text-green-600 dark:text-green-400 font-medium">مثال — رقم الهاتف: 0795245961 وكلمة المرور: 0795245961</p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
