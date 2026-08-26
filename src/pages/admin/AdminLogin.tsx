import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const token = localStorage.getItem('token');
            if (token && user?.role === 'ADMIN') navigate('/admin-panel', { replace: true });
        } catch {
            // A malformed old session is ignored and can be replaced by a new login.
        }
    }, [navigate]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const data = await authApi.login({ email: email.trim(), password });
            const token = data.token || data.access_token;
            const user = data.user;

            if (!token || !user || user.role !== 'ADMIN') {
                throw new Error('هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة.');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            window.dispatchEvent(new Event('user-updated'));
            navigate('/admin-panel', { replace: true });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'تعذر تسجيل الدخول',
                description: error instanceof Error ? error.message : 'تحقق من البريد الإلكتروني وكلمة المرور.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4" dir="rtl">
            <Card className="w-full max-w-md border-white/15 bg-white/95 shadow-2xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 shadow-lg">
                        <ShieldCheck className="h-9 w-9 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-900">دخول إدارة النظام</CardTitle>
                        <CardDescription className="mt-2">هذه الصفحة مخصصة لمشرفي Doctor Jo فقط.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="admin-email">البريد الإلكتروني</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="admin@example.com"
                                autoComplete="email"
                                required
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-password">كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete="current-password"
                                    required
                                    dir="ltr"
                                    className="pl-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                            تسجيل الدخول إلى لوحة الإدارة
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
