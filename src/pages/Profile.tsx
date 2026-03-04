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
                toastWithSound.success("Profile updated successfully");

                // Update local storage and dispatch event to sync Header
                localStorage.setItem('user', JSON.stringify(updatedData));
                window.dispatchEvent(new Event('user-updated'));

                setProfile(updatedData);
                setName(updatedData.name || "");
                setEmail(updatedData.email || "");
                setPassword("");
            } else {
                const err = await res.json();
                toastWithSound.error(err.error || "Failed to update profile");
            }
        } catch (error) {
            toastWithSound.error("An error occurred");
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
                toastWithSound.success("Avatar updated!");

                // Update local storage and dispatch event to sync Header
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('user-updated'));

                setProfile(updatedUser);
            } else {
                toastWithSound.error("Failed to upload avatar");
            }
        } catch (error) {
            toastWithSound.error("Upload error");
        } finally {
            setUploading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/auth");
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-background" dir="rtl">

            {/* Header */}
            <header className="border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-primary/10 text-primary rounded-full">
                            <ArrowRight className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <img src="./logo.png" alt="Logo" className="h-10 w-10 rounded-xl shadow-lg object-contain" />
                            <div>
                                <h1 className="text-xl font-black leading-tight text-foreground">
                                    حظƒظٹم
                                </h1>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">AL-Khatib Software</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <Button variant="outline" className="text-muted-foreground border-primary/20 hover:text-primary hover:bg-primary/5 gap-2 rounded-full font-bold px-6" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">طھسجظٹل الخرظˆج</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-10 max-w-7xl animate-fade-in relative z-10">
                <HeroSection
                    pageTitle="الملظپ الشخصظٹ"
                    doctorName={profile?.name ? `د. ${profile.name}` : 'د. حظƒظٹم'}
                    description="إدارة معلظˆماطھظƒ الشخصظٹة ظˆإعداداطھ الحساب"
                    icon={User}
                />


                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Profile Card */}
                    <Card className="md:col-span-1 border border-white/40 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground font-black">الصظˆرة الشخصظٹة</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6">
                            <div className="relative group cursor-pointer">
                                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                    <AvatarImage src={profile?.avatar?.startsWith('http') ? profile.avatar : `${API_URL}${profile?.avatar}`} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-primary text-white font-black">{profile?.name?.charAt(0) || <User />}</AvatarFallback>
                                </Avatar>
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-primary/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white">
                                    <Upload className="w-10 h-10" />
                                </label>
                                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-black text-xl text-foreground">{profile?.name || "مسطھخدم"}</h3>
                                <p className="text-sm text-muted-foreground font-bold">{profile?.email}</p>
                                <div className="mt-4 inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                                    {profile?.role}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Edit */}
                    <Card className="md:col-span-2 border border-white/40 dark:border-white/10 bg-white/20 dark:bg-black/40 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-foreground font-black">طھعدظٹل المعلظˆماطھ</CardTitle>
                            <CardDescription className="text-muted-foreground font-bold">قم بطھحدظٹث معلظˆماطھظƒ الشخصظٹة ظˆظƒلمة المرظˆر</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-foreground font-bold">الاسم الظƒامل</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="أدخل اسمظƒ"
                                    className="bg-white/50 dark:bg-white/5 border-border focus:border-primary text-foreground rounded-2xl h-12"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-foreground font-bold">البرظٹد الإلظƒطھرظˆنظٹ</Label>
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="bg-white/50 dark:bg-white/5 border-border focus:border-primary text-foreground rounded-2xl h-12"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-foreground font-bold">ظƒلمة المرظˆر الجدظٹدة (اخطھظٹارظٹ)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="اطھرظƒه ظپارط؛اً إذا لم طھرد الطھط؛ظٹظٹر"
                                    className="bg-white/50 dark:bg-white/5 border-border focus:border-primary text-foreground rounded-2xl h-12"
                                />
                            </div>

                            <div className="pt-6 flex justify-end">
                                <Button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 rounded-2xl px-10 h-12 transition-all"
                                >
                                    {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    حظپظ الطھط؛ظٹظٹراطھ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
