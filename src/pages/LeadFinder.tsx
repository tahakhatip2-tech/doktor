import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Target, MapPin, Briefcase, ArrowUp } from "lucide-react";
import { toastWithSound } from '@/lib/toast-with-sound';
import { dataApi } from "@/lib/api";

export default function LeadFinder() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [platform, setPlatform] = useState("facebook");

    const handleSearch = async () => {
        if (!keyword) {
            toastWithSound.error("يرجى إدخال كلمة مظپطھاحظٹة للبحث");
            return;
        }
        setLoading(true);
        setResults([]);
        try {
            const data = await dataApi.searchLeads({ keyword, location, platform });
            if (data.results && data.results.length > 0) {
                setResults(data.results);
                toastWithSound.success(`تم العثظˆر على ${data.results.length} نطھظٹجة`);
            } else {
                toastWithSound.error("لم ظٹتم العثظˆر على نطھائجطŒ جرب كلماطھ مظپطھاحظٹة مخطھلظپة");
            }
        } catch (error: any) {
            toastWithSound.error(error.message || "ظپشل البحث");
        } finally {
            setLoading(false);
        }
    };

    const handleExtract = async (url: string) => {
        toastWithSound.success("جارظٹ اسطھخراج البيانات من الرابط...");
        try {
            // We use the same scrape endpoint
            await dataApi.scrape({ url, platform });
            toastWithSound.success("تم اسطھخراج ظˆحظپظ البيانات بنجاح في قاعدة البيانات!");
        } catch (error) {
            toastWithSound.error("ظپشل الاسطھخراج من هذا الرابط");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold">الباحث الذظƒظٹ (Lead Finder)</h2>
                    <p className="text-muted-foreground">ابحث عن عملاط، محتملظٹن بدقة عالظٹة عبر محرظƒاطھ البحث المطھقدمةطŒ دظˆن الحاجة لحساباطھ أظˆ APIs.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => window.location.hash = '/'}>
                    <ArrowUp className="h-4 w-4 transform -rotate-90" />
                    رجظˆع للرئظٹسظٹة
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Configuration Card */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            إعدادات الاسطھهداظپ
                        </CardTitle>
                        <CardDescription>حدد مظˆاصظپاطھ جمهظˆرظƒ المسطھهدظپ بدقة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    الكلمة المظپطھاحظٹة / الاهتمام
                                </label>
                                <Input
                                    placeholder="مثال: مهندس مدنظٹطŒ طھجارة سظٹاراطھطŒ عقاراطھ"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    المظˆقع الجط؛رافي
                                </label>
                                <Input
                                    placeholder="مثال: الرظٹاضطŒ دبظٹطŒ القاهرة"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">المنصة المسطھهدظپة</label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="اختر المنصة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="google">جظˆجل / خرائط جظˆجل (Google Maps)</SelectItem>
                                    <SelectItem value="facebook">فيسبظˆظƒ (Facebook)</SelectItem>
                                    <SelectItem value="linkedin">لظٹنظƒد إن (LinkedIn)</SelectItem>
                                    <SelectItem value="instagram">إنسطھجرام (Instagram)</SelectItem>
                                    <SelectItem value="twitter">طھظˆظٹطھر (X)</SelectItem>
                                    <SelectItem value="all">الظˆظٹب العام (مظپطھظˆح)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleSearch}
                                className="w-full h-12 text-lg font-bold transition-all hover:scale-[1.01]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        جارظٹ البحث في جظˆجل...
                                    </>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-5 w-5" />
                                        ابدأ البحث
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card - Now Beside Search Card */}
                <Card className="border-border/50 bg-blue-500/5 border-blue-500/20 h-full">
                    <CardHeader>
                        <CardTitle className="text-blue-500">ظƒظٹظپ ظٹعمل هذا النظامطں</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <ul className="list-disc list-inside space-y-2">
                            <li>ظٹسطھخرج الرظˆابط من نطھائج البحث المطھقدمة.</li>
                            <li>ظٹمظƒنظƒ بعد ذلك "اسطھخراج البيانات" من كل رابط بنقرة زر.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Text Import Card - Now Full Width Below */}
                <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            اسطھظٹراد ذظƒظٹ للنصظˆص (نسخ ظˆلصق)
                        </CardTitle>
                        <CardDescription>الصق أظٹ نص ظٹحطھظˆظٹ على أرقام ظˆأسماط، (مثلاً من خرائط جظˆجل) ظˆسنقظˆم باسطھخراجها ظپظˆراً.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            className="w-full h-32 p-3 rounded-md bg-background/50 border border-input resize-none focus:ring-2 focus:ring-primary/50 outline-none"
                            placeholder="الصق النص هنا... (مثلاً: عظٹادة الدكتور X - 079xxxxx...)"
                            id="import-text"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={async () => {
                                    const text = (document.getElementById('import-text') as HTMLTextAreaElement).value;
                                    if (!text) return toastWithSound.error("يرجى لصق نص أظˆلاً");

                                    toastWithSound.success("جارظٹ طھحلظٹل النص...");
                                    try {
                                        const res = await fetch(`${BASE_URL}/leads/parse`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                                            },
                                            body: JSON.stringify({ text, platform: 'Manual Import' })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            toastWithSound.success(`تم اسطھخراج ظˆحظپظ ${data.count} جهة اطھصال جديدة!`);
                                        } else {
                                            toastWithSound.error("ظپشل الطھحلظٹل");
                                        }
                                    } catch (e) {
                                        toastWithSound.error("حدث خطأ أثناء الاطھصال بالخادم");
                                    }
                                }}
                                className="bg-primary hover:bg-primary/90 text-white gap-2"
                            >
                                <Target className="h-4 w-4" />
                                اسطھخراج ظˆبدط، الحملة
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Results Section */}
            {results.length > 0 && (
                <div className="space-y-4 animate-fade-in relative">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        نطھائج البحث ({results.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {results.map((result, idx) => (
                            <Card key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                                    <div className="space-y-1 flex-1">
                                        <h4 className="font-semibold text-lg text-primary hover:underline cursor-pointer" onClick={() => window.open(result.url, '_blank')}>
                                            {result.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{result.snippet}</p>
                                        <p className="text-xs text-blue-500/80 dir-ltr font-mono">{result.url}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="whitespace-nowrap gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                                        onClick={() => handleExtract(result.url)}
                                    >
                                        <Search className="h-4 w-4" />
                                        اسطھخراج البيانات
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Scroll To Top Button */}
            <Button
                className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg z-50 animate-bounce"
                onClick={() => {
                    const mainElement = document.querySelector('main');
                    if (mainElement) {
                        mainElement.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
                style={{ display: results.length > 5 ? 'flex' : 'none' }}
            >
                <ArrowUp className="h-6 w-6" />
            </Button>
        </div>
    );
}
