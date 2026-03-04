import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, User, Phone, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientRegister() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'ظƒلمة المرظˆر ط؛ظٹر مطھطابقة' });
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...payload } = formData;
            const response = await axios.post(`${API_URL}/patient/auth/register`, payload);
            localStorage.setItem('patient_token', response.data.token);
            localStorage.setItem('patient_user', JSON.stringify(response.data.patient));
            toast({ title: 'طھم الطھسجظٹل بنجاح!', description: 'مرحباً بظƒ ظپظٹ بظˆابة المرضى' });
            navigate('/patient/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ ظپظٹ الطھسجظٹل',
                description: error.response?.data?.message || 'حدث خطأ أثناط، الطھسجظٹل',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <div className="w-full max-w-2xl">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gradient-primary mb-2">حظƒظٹم الأردن</h1>
                    <p className="text-muted-foreground">إنشاط، حساب جدظٹد ظپظٹ بظˆابة المرضى</p>
                </div>

                <Card className="shadow-elevated animate-slide-up">
                    <CardHeader>
                        <CardTitle className="text-2xl">إنشاط، حساب</CardTitle>
                        <CardDescription>
                            سجّل برقم هاطھظپظƒ â€” لا حاجة لبرظٹد إلظƒطھرظˆنظٹ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Required fields row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">الاسم الظƒامل *</Label>
                                    <div className="relative">
                                        <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="pr-10"
                                            placeholder="أدخل اسمظƒ الظƒامل"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">رقم الهاطھظپ *</Label>
                                    <div className="relative">
                                        <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pr-10"
                                            placeholder="07XXXXXXXX"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">ظƒلمة المرظˆر *</Label>
                                    <div className="relative">
                                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pr-10"
                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">طھأظƒظٹد ظƒلمة المرظˆر *</Label>
                                    <div className="relative">
                                        <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pr-10"
                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Optional fields */}
                            <div className="border-t pt-4">
                                <p className="text-xs text-muted-foreground mb-3 font-medium">معلظˆماطھ إضاظپظٹة (اخطھظٹارظٹ)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">طھارظٹخ المظٹلاد</Label>
                                        <div className="relative">
                                            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                                className="pr-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">الجنس</Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">اخطھر...</option>
                                            <option value="male">ذظƒر</option>
                                            <option value="female">أنثى</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="address">العنظˆان</Label>
                                    <div className="relative">
                                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="pr-10"
                                            placeholder="المدظٹنةطŒ الحظٹ"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gradient-primary text-white shadow-glow"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="ml-2 h-4 w-4 animate-spin" />جارظٹ الطھسجظٹل...</>
                                ) : (
                                    'إنشاط، الحساب'
                                )}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                لدظٹظƒ حساب بالظپعلطں{' '}
                                <Link to="/patient/login" className="text-primary hover:underline font-medium">
                                    طھسجظٹل الدخظˆل
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
