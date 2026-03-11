import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
    Plus, Trash2, Tag, Calendar, Clock, Image as ImageIcon,
    Building2, Heart, Infinity, X, Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Offer {
    id: number;
    title: string;
    content: string;
    image?: string;
    isPermanent: boolean;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    _count: { likes: number };
}

export default function OffersManager() {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [isPermanent, setIsPermanent] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };

    const fetchOffers = async () => {
        try {
            const res = await axios.get(`${API_URL}/offers/mine`, { headers });
            setOffers(Array.isArray(res.data) ? res.data : []);
        } catch { setOffers([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            toast({ variant: 'destructive', title: 'يرجى تعبئة العنوان والمحتوى' });
            return;
        }
        setSaving(true);
        try {
            await axios.post(`${API_URL}/offers`, {
                title, content, image: image || undefined,
                isPermanent,
                startDate: isPermanent ? undefined : startDate,
                endDate: isPermanent ? undefined : endDate,
            }, { headers });
            toast({ title: '✅ تم نشر العرض بنجاح!' });
            setTitle(''); setContent(''); setImage(''); setIsPermanent(true);
            setStartDate(''); setEndDate(''); setShowForm(false);
            fetchOffers();
        } catch {
            toast({ variant: 'destructive', title: 'فشل نشر العرض' });
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/offers/${id}`, { headers });
            setOffers(prev => prev.filter(o => o.id !== id));
            toast({ title: 'تم حذف العرض' });
        } catch { toast({ variant: 'destructive', title: 'فشل الحذف' }); }
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <Tag className="h-6 w-6 text-orange-500" />
                        إدارة عروضي
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">انشر عروضك وخصوماتك ليراها مرضاؤك</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-orange-300/40 gap-2"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? 'إلغاء' : 'عرض جديد'}
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="border-orange-200 shadow-lg bg-gradient-to-br from-orange-50/50 to-white">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{user?.clinic_name || user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.clinic_specialty}</p>
                            </div>
                        </div>

                        <Input
                            placeholder="عنوان العرض... (مثال: خصم 20% على جلسة الليزر)"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="font-semibold text-base border-orange-200 focus:border-orange-400"
                        />
                        <Textarea
                            placeholder="تفاصيل العرض... أخبر مرضاءك بكل التفاصيل"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={4}
                            className="border-orange-200 focus:border-orange-400 resize-none"
                        />

                        {/* Image Preview */}
                        {image && (
                            <div className="relative rounded-xl overflow-hidden">
                                <img src={image} alt="offer" className="w-full h-48 object-cover" />
                                <Button size="icon" variant="destructive" className="absolute top-2 left-2"
                                    onClick={() => setImage('')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Duration Toggle */}
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/40">
                            <Infinity className="h-5 w-5 text-orange-500" />
                            <Label htmlFor="isPermanent" className="font-semibold cursor-pointer flex-1">
                                عرض دائم (بدون تاريخ انتهاء)
                            </Label>
                            <Switch
                                id="isPermanent"
                                checked={isPermanent}
                                onCheckedChange={setIsPermanent}
                            />
                        </div>

                        {!isPermanent && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">تاريخ البدء</Label>
                                    <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="border-orange-200" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">تاريخ الانتهاء</Label>
                                    <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                                        className="border-orange-200" />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Button variant="outline" size="sm" className="gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                                onClick={() => fileRef.current?.click()}>
                                <ImageIcon className="h-4 w-4" /> إضافة صورة
                            </Button>
                            <div className="flex-1" />
                            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white gap-2"
                                onClick={handleSubmit} disabled={saving}>
                                <Sparkles className="h-4 w-4" />
                                {saving ? 'جاري النشر...' : 'نشر العرض'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Offers List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Tag className="h-14 w-14 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold text-lg">لا توجد عروض حتى الآن</p>
                    <p className="text-sm mt-1">ابدأ بنشر أول عرض لمرضائك</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map(offer => (
                        <Card key={offer.id} className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{user?.clinic_name || user?.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(offer.createdAt), 'PPpp', { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {offer.isPermanent ? (
                                            <Badge className="bg-green-100 text-green-700 border-0 gap-1 text-xs">
                                                <Infinity className="h-3 w-3" /> دائم
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-orange-100 text-orange-700 border-0 gap-1 text-xs">
                                                <Calendar className="h-3 w-3" />
                                                حتى {offer.endDate ? format(new Date(offer.endDate), 'PP', { locale: ar }) : '–'}
                                            </Badge>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(offer.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-base mb-1">{offer.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{offer.content}</p>

                                {offer.image && (
                                    <img src={offer.image} alt="offer" className="mt-3 w-full h-40 object-cover rounded-xl" />
                                )}

                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                                    <Heart className="h-4 w-4 text-red-400" />
                                    <span className="text-sm text-muted-foreground">{offer._count?.likes || 0} إعجاب</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
