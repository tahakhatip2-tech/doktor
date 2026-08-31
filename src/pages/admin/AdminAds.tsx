import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { dataApi } from "@/lib/api";
import { Megaphone, Plus, Trash2, Upload, Building2, Calendar, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { BASE_URL } from "@/lib/api";

const logoSrc = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

interface Ad {
    id: number;
    title: string;
    content: string;
    image?: string;
    isActive: boolean;
    isSponsored: boolean;
    sponsorName?: string;
    sponsorLogo?: string;
    sponsorPhone?: string;
    isPermanent: boolean;
    createdAt: string;
}

const defaultForm = { title: "", content: "", sponsorName: "", sponsorLogo: "", sponsorPhone: "", image: "", isPermanent: true, startDate: "", endDate: "" };

const AdminAds = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // تحقق من توكن المدير
    const getAdminToken = (): string | null => {
        const t = localStorage.getItem('token') || localStorage.getItem('auth_token');
        // تجاهل القيمة الحرفية "null"
        return (t && t !== 'null') ? t : null;
    };

    const fetchAds = async () => {
        try {
            const data = await dataApi.get("/admin/ads");
            setAds(Array.isArray(data) ? data : []);
        } catch { setAds([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAds(); }, []);

    const handleUpload = async (file: File, field: "sponsorLogo" | "image") => {
        const token = getAdminToken();
        if (!token) {
            toast({ variant: "destructive", title: "انتهت الجلسة", description: "يرجى تسجيل الدخول من جديد" });
            navigate("/admin-login");
            return;
        }
        field === "sponsorLogo" ? setUploadingLogo(true) : setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            // استخدام fetch مباشرةً مع التوكن الصحيح
            const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/ads/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'Bypass-Tunnel-Reminder': 'true',
                },
                body: fd,
            });
            if (res.status === 401) {
                toast({ variant: "destructive", title: "انتهت الجلسة", description: "يرجى تسجيل الدخول من جديد" });
                navigate("/admin-login");
                return;
            }
            const data = await res.json();
            if (data?.url) {
                setForm(f => ({ ...f, [field]: data.url }));
                toast({ title: "تم الرفع بنجاح ✅" });
            } else {
                throw new Error(data?.error || data?.message || "فشل الرفع");
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "فشل الرفع",
                description: err?.message || "حدث خطأ أثناء رفع الملف"
            });
        } finally {
            field === "sponsorLogo" ? setUploadingLogo(false) : setUploadingImage(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim() || !form.sponsorName.trim() || !form.sponsorPhone.trim()) {
            toast({ variant: "destructive", title: "يرجى ملء الحقول المطلوبة" }); return;
        }
        setSubmitting(true);
        try {
            await dataApi.post("/admin/ads", { ...form, startDate: form.startDate || undefined, endDate: form.endDate || undefined });
            toast({ title: "🎉 تم نشر الإعلان بنجاح!" });
            setDialogOpen(false); setForm(defaultForm); fetchAds();
        } catch { toast({ variant: "destructive", title: "فشل نشر الإعلان" }); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
        try { await dataApi.delete(`/admin/ads/${id}`); setAds(p => p.filter(a => a.id !== id)); toast({ title: "تم حذف الإعلان" }); }
        catch { toast({ variant: "destructive", title: "فشل الحذف" }); }
    };

    const handleToggle = async (id: number) => {
        try {
            const updated = await dataApi.patch(`/admin/ads/${id}/toggle`, {});
            setAds(p => p.map(a => a.id === id ? { ...a, isActive: updated.isActive } : a));
            toast({ title: updated.isActive ? "✅ تم تفعيل الإعلان" : "⏸️ تم إيقاف الإعلان" });
        } catch { toast({ variant: "destructive", title: "فشل تغيير الحالة" }); }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                        <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">الإعلانات الممولة</h2>
                        <p className="text-sm text-slate-500">تظهر في صفحة آخر الأخبار لجميع المرضى</p>
                    </div>
                </div>
                <Button onClick={() => { setForm(defaultForm); setDialogOpen(true); }}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md">
                    <Plus className="h-4 w-4" /> إضافة إعلان
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "إجمالي الإعلانات", value: ads.length, c: "from-blue-600 from-50% to-blue-500 to-50%" },
                    { label: "الإعلانات النشطة", value: ads.filter(a => a.isActive).length, c: "from-green-600 from-50% to-green-500 to-50%" },
                    { label: "الموقوفة", value: ads.filter(a => !a.isActive).length, c: "from-slate-500 from-50% to-slate-400 to-50%" },
                ].map((s, i) => (
                    <div key={i} className={`relative rounded-full overflow-hidden shadow-md bg-gradient-to-l ${s.c} text-white`}>
                        <div className="absolute top-0 right-1/2 w-1.5 h-full bg-white/20 z-0 transform translate-x-1/2" />
                        <div className="py-3 px-5 relative z-10 flex items-center justify-between">
                            <div className="flex-1 text-right">
                                <p className="text-[10px] font-bold text-white/80 mb-0.5">{s.label}</p>
                                <p className="text-xl font-black">{s.value}</p>
                            </div>
                            <div className="p-2 rounded-full bg-white/20"><Megaphone className="h-4 w-4" /></div>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? <div className="text-center py-12 text-slate-400">جاري التحميل...</div>
                : ads.length === 0 ? (
                    <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
                        <CardContent className="py-16 text-center">
                            <Megaphone className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                            <p className="font-bold text-slate-600">لا توجد إعلانات ممولة حتى الآن</p>
                            <p className="text-sm text-slate-400 mt-1">اضغط "إضافة إعلان" للبدء</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {ads.map(ad => (
                            <Card key={ad.id} className={`overflow-hidden border shadow-sm transition-all hover:shadow-md ${ad.isActive ? "border-amber-200 bg-gradient-to-r from-amber-50/30 to-orange-50/20" : "border-slate-200 bg-slate-50 opacity-70"}`}>
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 h-14 w-14 rounded-xl border-2 border-amber-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                            {ad.sponsorLogo ? <img src={logoSrc(ad.sponsorLogo) || ""} alt="logo" className="h-full w-full object-contain p-1" /> : <Building2 className="h-7 w-7 text-amber-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-black gap-1"><Star className="h-3 w-3" />إعلان ممول</Badge>
                                                <Badge className={`text-[10px] font-bold ${ad.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{ad.isActive ? "نشط" : "موقوف"}</Badge>
                                                {ad.isPermanent && <Badge className="bg-blue-100 text-blue-700 text-[10px]">دائم</Badge>}
                                            </div>
                                            <p className="font-black text-slate-800 text-base">{ad.title}</p>
                                            <p className="text-sm text-amber-700 font-semibold">{ad.sponsorName}</p>
                                            {ad.sponsorPhone && <p className="text-xs text-amber-600 font-medium dir-ltr text-right">{ad.sponsorPhone}</p>}
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ad.content}</p>
                                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: ar })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">{ad.isActive ? "نشط" : "موقوف"}</span>
                                                <Switch checked={ad.isActive} onCheckedChange={() => handleToggle(ad.id)} />
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(ad.id)} className="text-red-500 hover:bg-red-50 h-8 w-8 p-0 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {ad.image && (
                                        <div className="mt-3 rounded-lg overflow-hidden max-h-48 border border-amber-100 flex items-center justify-center bg-black/5">
                                            {ad.image.match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video src={logoSrc(ad.image) || ""} controls className="max-w-full max-h-48" />
                                            ) : (
                                                <img src={logoSrc(ad.image) || ""} alt="ad" className="max-w-full max-h-48 object-contain" />
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black">
                            <Megaphone className="h-5 w-5 text-amber-500" /> إضافة إعلان ممول جديد
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="font-bold text-slate-700 mb-1.5 block">اسم الشركة / الجهة الراعية *</Label>
                            <Input placeholder="مثال: شركة الدواء الأردنية" value={form.sponsorName} onChange={e => setForm(f => ({ ...f, sponsorName: e.target.value }))} className="rounded-xl" />
                        </div>
                        <div>
                            <Label className="font-bold text-slate-700 mb-1.5 block">رقم واتساب الراعي (للتواصل) *</Label>
                            <Input placeholder="مثال: 962790000000" value={form.sponsorPhone} onChange={e => setForm(f => ({ ...f, sponsorPhone: e.target.value }))} className="rounded-xl" dir="ltr" />
                        </div>
                        <div>
                            <Label className="font-bold text-slate-700 mb-1.5 block">شعار الشركة</Label>
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {form.sponsorLogo ? <img src={logoSrc(form.sponsorLogo) || ""} alt="logo" className="h-full w-full object-contain p-1" /> : <Building2 className="h-6 w-6 text-amber-300" />}
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "sponsorLogo")} />
                                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="gap-2 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50">
                                    <Upload className="h-4 w-4" /> {uploadingLogo ? "جاري الرفع..." : "رفع الشعار"}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label className="font-bold text-slate-700 mb-1.5 block">عنوان الإعلان *</Label>
                            <Input placeholder="عنوان جذاب للإعلان" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-xl" />
                        </div>
                        <div>
                            <Label className="font-bold text-slate-700 mb-1.5 block">محتوى الإعلان *</Label>
                            <Textarea placeholder="اكتب نص الإعلان هنا..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3} className="rounded-xl resize-none" />
                        </div>
                        <div>
                            <Label className="font-bold text-slate-700 mb-1.5 block">وسائط الإعلان (صورة أو فيديو) (اختياري)</Label>
                            <div className="flex items-center gap-3">
                                {form.image && <div className="h-12 w-20 rounded-lg overflow-hidden border flex items-center justify-center bg-black/5">
                                    {form.image.match(/\.(mp4|webm|ogg)$/i) ? <span className="text-[10px] font-bold">فيديو</span> : <img src={logoSrc(form.image) || ""} alt="ad" className="h-full w-full object-cover" />}
                                </div>}
                                <input ref={imageInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], "image")} />
                                <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="gap-2 rounded-xl">
                                    <Upload className="h-4 w-4" /> {uploadingImage ? "جاري الرفع..." : "رفع ملف"}
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <Switch checked={form.isPermanent} onCheckedChange={v => setForm(f => ({ ...f, isPermanent: v }))} />
                            <div><p className="font-bold text-slate-700 text-sm">إعلان دائم</p><p className="text-xs text-slate-500">يظهر بشكل مستمر بدون تاريخ انتهاء</p></div>
                        </div>
                        {!form.isPermanent && (
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label className="font-bold text-slate-700 mb-1.5 block text-xs">تاريخ البداية</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="rounded-xl text-sm" /></div>
                                <div><Label className="font-bold text-slate-700 mb-1.5 block text-xs">تاريخ الانتهاء</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="rounded-xl text-sm" /></div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">إلغاء</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl">
                            <Megaphone className="h-4 w-4" /> {submitting ? "جاري النشر..." : "نشر الإعلان"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAds;
