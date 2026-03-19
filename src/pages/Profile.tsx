import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toastWithSound } from '@/lib/toast-with-sound';
import { Loader2, Upload, Save, User, ArrowRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BASE_URL, API_URL } from "@/lib/api";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    avatar: string;
    role: string;
    expiry_date: string;
}

const Profile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { signOut } = useAuth();

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setName(data.name || "");
                setEmail(data.email || "");
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, ...(password ? { password } : {}) }),
            });

            if (res.ok) {
                const updatedData = await res.json();
                toastWithSound.success("تم تحديث الملف الشخصي بنجاح");

                localStorage.setItem('user', JSON.stringify(updatedData));
                window.dispatchEvent(new Event('user-updated'));

                setProfile(updatedData);
                setName(updatedData.name || "");
                setEmail(updatedData.email || "");
                setPassword("");
            } else {
                const err = await res.json();
                toastWithSound.error(err.error || "خطأ في تحديث الملف الشخصي");
            }
        } catch (error) {
            toastWithSound.error("حدث خطأ غير متوقع");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("avatar", e.target.files[0]);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/auth/profile/avatar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                const updatedUser = await res.json();
                toastWithSound.success("تم تحديث الصورة الشخصية!");

                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('user-updated'));

                setProfile(updatedUser);
            } else {
                toastWithSound.error("فشل في رفع الصورة");
            }
        } catch (error) {
            toastWithSound.error("حدث خطأ أثناء الرفع");
        } finally {
            setUploading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/auth");
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50/50" dir="rtl">

            {/* Header */}
            <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-blue-50 text-blue-600 rounded-full transition-colors">
                            <ArrowRight className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <img src="./logo.png" alt="Logo" className="h-10 w-10 rounded-xl shadow-sm object-contain bg-white" />
                            <div>
                                <h1 className="text-xl font-black leading-tight text-slate-800">
                                    حكيم
                                </h1>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">AL-Khatib Software</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <Button variant="outline" className="text-red-500 border-red-100 hover:text-red-600 hover:bg-red-50 gap-2 rounded-full font-bold px-6 shadow-sm" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">تسجيل الخروج</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 max-w-5xl animate-fade-in relative z-10 space-y-6 mt-4">
                <HeroSection
                    pageTitle="الملف الشخصي"
                    doctorName={profile?.name ? `د. ${profile.name}` : 'الطبيب'}
                    description="إدارة معلوماتك الشخصية وإعدادات حسابك الأساسية"
                    icon={User}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Profile Card */}
                    <Card className="md:col-span-1 border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-slate-800 font-black">الصورة الشخصية</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 pt-4">
                            <div className="relative group cursor-pointer">
                                <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-white shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                                    <AvatarImage src={profile?.avatar?.startsWith('http') ? profile.avatar : `${API_URL}${profile?.avatar}`} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-blue-600 text-white font-black">{profile?.name?.charAt(0) || <User />}</AvatarFallback>
                                </Avatar>
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white">
                                    <Upload className="w-8 h-8" />
                                </label>
                                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-black text-xl text-slate-800">{profile?.name || "مستخدم"}</h3>
                                <p className="text-sm text-slate-500 font-bold">{profile?.email}</p>
                                <div className="mt-4 inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                                    {profile?.role === 'USER' ? 'طبيب' : profile?.role}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Edit */}
                    <Card className="md:col-span-2 border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow pb-2">
                        <CardHeader>
                            <CardTitle className="text-slate-800 font-black">تعديل المعلومات</CardTitle>
                            <CardDescription className="text-slate-500 font-bold">قم بتحديث معلوماتك الشخصية وكلمة المرور</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-slate-700 font-bold">الاسم الكامل</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="أدخل اسمك"
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800 rounded-xl h-12 shadow-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-slate-700 font-bold">البريد الإلكتروني</Label>
                                    <Input
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800 rounded-xl h-12 shadow-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label htmlFor="password" className="text-slate-700 font-bold">كلمة المرور الجديدة <span className="text-slate-400 font-normal text-xs">(اختياري)</span></Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="اتركه فارغاً إذا لم ترد التغيير"
                                    className="bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800 rounded-xl h-12 shadow-sm font-medium max-w-sm"
                                />
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex justify-end">
                                <Button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black shadow-lg shadow-blue-500/30 rounded-xl px-10 h-12 transition-all"
                                >
                                    {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    حفظ التغييرات
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
            <div className="mt-12">
                <Footer />
            </div>
        </div>
    );
};

export default Profile;
