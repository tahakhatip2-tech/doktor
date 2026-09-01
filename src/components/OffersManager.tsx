import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
    Plus, Trash2, Tag, Clock, Image as ImageIcon,
    Building2, Heart, X, Sparkles, MessageCircle, Send, PlayCircle, Share2, Pill, Megaphone, Phone, Star
} from 'lucide-react';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BASE_URL } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const logoSrc = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: {
        name: string;
        avatar?: string;
    };
}

interface OfferAuthor {
    id: number;
    name: string;
    clinic_name?: string;
    avatar?: string;
    clinic_specialty?: string;
}

interface Offer {
    id: number;
    title: string;
    content: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    isLiked?: boolean;
    isLikedByMe?: boolean;
    likesCount?: number;
    _count: { likes: number, comments: number };
    comments?: Comment[];
    user: OfferAuthor;
}

interface OffersManagerProps {
    userType?: 'doctor' | 'pharmacy';
}

export default function OffersManager({ userType = 'doctor' }: OffersManagerProps) {
    const { user: doctorUser } = useAuth();
    const { toast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [isVideo, setIsVideo] = useState(false);

    const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
    const [selectedOfferForComments, setSelectedOfferForComments] = useState<Offer | null>(null);
    const [expandedPosts, setExpandedPosts] = useState<{ [key: number]: boolean }>({});

    const toggleExpand = (id: number) => {
        setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isPharmacy = userType === 'pharmacy';
    const tokenKey = isPharmacy ? 'pharmacy_token' : 'token';
    const userKey = isPharmacy ? 'pharmacy_user' : 'user';
    const token = localStorage.getItem(tokenKey);
    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem(userKey) || 'null'); } catch { return null; }
    })();
    const currentUserId = storedUser?.id;
    const currentAuthor = isPharmacy ? storedUser : doctorUser;
    const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };

    const fetchOffers = async () => {
        try {
            const res = await axios.get(`${API_URL}/offers/feed`, { headers });
            setOffers(Array.isArray(res.data) ? res.data : []);
        } catch { setOffers([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsVideo(file.type.startsWith('video/'));

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
                isPermanent: true, // Always permanent like Facebook
            }, { headers });
            toast({ title: '✅ تم نشر المنشور بنجاح!' });
            setTitle(''); setContent(''); setImage(''); setIsVideo(false);
            setShowForm(false);
            fetchOffers();
        } catch {
            toast({ variant: 'destructive', title: 'فشل النشر' });
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/offers/${id}`, { headers });
            setOffers(prev => prev.filter(o => o.id !== id));
            toast({ title: 'تم الحذف بنجاح' });
        } catch { toast({ variant: 'destructive', title: 'فشل الحذف' }); }
    };

    const handleAddComment = async (offerId: number) => {
        const text = commentText[offerId];
        if (!text?.trim()) return;

        setPostingComment(prev => ({ ...prev, [offerId]: true }));
        try {
            const res = await axios.post(`${API_URL}/offers/${offerId}/comments`, { content: text }, { headers });
            setOffers(prev => prev.map(o => {
                if (o.id === offerId) {
                    return {
                        ...o,
                        comments: [...(o.comments || []), res.data],
                        _count: { ...o._count, comments: (o._count?.comments || 0) + 1 }
                    };
                }
                return o;
            }));
            setCommentText(prev => ({ ...prev, [offerId]: '' }));
            toast({ title: 'تمت إضافة التعليق' });
        } catch {
            toast({ variant: 'destructive', title: 'فشل إضافة التعليق' });
        } finally {
            setPostingComment(prev => ({ ...prev, [offerId]: false }));
        }
    };

    const handleLike = async (offerId: number) => {
        try {
            const res = await axios.post(`${API_URL}/offers/${offerId}/like`, {}, { headers });
            setOffers(prev => prev.map(o => {
                if (o.id === offerId) {
                    const isNowLiked = res.data.liked;
                    return {
                        ...o,
                        isLiked: isNowLiked,
                        isLikedByMe: isNowLiked,
                        _count: { ...o._count, likes: isNowLiked ? (o._count?.likes || 0) + 1 : Math.max(0, (o._count?.likes || 0) - 1) }
                    };
                }
                return o;
            }));
        } catch {
            toast({ variant: 'destructive', title: 'فشل الإعجاب' });
        }
    };

    const handleShare = (offer: any) => {
        const shareText = `${offer.title}\n\n${offer.content}`;
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: offer.title,
                text: shareText,
                url: url,
            }).catch(() => {});
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + url)}`;
            window.open(whatsappUrl, '_blank');
            toast({ title: 'تم الفتح في واتساب!' });
        }
    };

    const checkIsVideo = (url: string | undefined) => {
        if (!url) return false;
        return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg)$/i);
    };

    const displayName = (author?: { name?: string; clinic_name?: string }) => {
        return author?.clinic_name || author?.name || (isPharmacy ? 'الصيدلية' : 'العيادة');
    };

    const roleLabel = isPharmacy ? 'الصيدلية' : 'العيادة';
    const RoleIcon = isPharmacy ? Pill : Building2;
    const accent = isPharmacy ? 'teal' : 'orange';
    const accentRgb = isPharmacy ? '13,148,136' : '249,115,22';

    return (
        <div className="space-y-6" dir="rtl">
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                    <Button className={cn(
                        "fixed bottom-24 left-4 z-50 flex items-center justify-center h-14 w-14 rounded-full text-white p-0 border-2 border-white dark:border-zinc-900 hover:scale-105 active:scale-95 transition-all duration-300",
                        isPharmacy
                            ? "bg-gradient-to-tr from-teal-600 via-teal-500 to-teal-400 shadow-[0_8px_25px_rgba(20,184,166,0.4)]"
                            : "bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-400 shadow-[0_8px_25px_rgba(249,115,22,0.4)]"
                    )}>
                        <Plus className="h-7 w-7" />
                    </Button>
                </DialogTrigger>
                <DialogContent className={cn("sm:max-w-[500px] shadow-xl bg-gradient-to-br from-white to-blue-50/50", isPharmacy ? "border-teal-200" : "border-orange-200")} dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-900">
                            <Sparkles className={cn("h-5 w-5", isPharmacy ? "text-teal-500" : "text-orange-500")} />
                            إنشاء منشور جديد
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shadow",
                                isPharmacy
                                    ? "bg-gradient-to-br from-teal-600 to-teal-500"
                                    : "bg-gradient-to-br from-blue-600 to-orange-500"
                            )}>
                                {currentAuthor?.avatar ? (
                                    <img src={logoSrc(currentAuthor.avatar) || ''} alt="avatar" className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <RoleIcon className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-800">{displayName(currentAuthor)}</p>
                                <Badge variant="outline" className={cn("text-[10px] py-0 h-4 mt-0.5", isPharmacy ? "border-teal-200 text-teal-600 bg-teal-50" : "border-blue-200 text-blue-600 bg-blue-50")}>
                                    {roleLabel}
                                </Badge>
                            </div>
                        </div>

                        <Input
                            placeholder="عنوان المنشور..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className={cn("font-bold text-base border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 bg-transparent placeholder:font-medium", isPharmacy ? "focus-visible:border-teal-500" : "focus-visible:border-orange-500")}
                        />
                        <Textarea
                            placeholder="بم تفكر؟ تفاصيل المنشور..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={4}
                            className="border-0 rounded-none px-0 focus-visible:ring-0 bg-transparent resize-none text-slate-700 text-base"
                        />

                        {image && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-black/5 flex items-center justify-center min-h-[150px]">
                                {isVideo ? (
                                    <video src={image} controls className="w-full max-h-[300px] object-contain" />
                                ) : (
                                    <img src={image} alt="post media" className="w-full max-h-[300px] object-contain" />
                                )}
                                <Button size="icon" variant="destructive" className="absolute top-2 left-2 rounded-full h-8 w-8 shadow-md"
                                    onClick={() => { setImage(''); setIsVideo(false); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleImageChange} />
                            <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-semibold rounded-full"
                                onClick={() => fileRef.current?.click()}>
                                <ImageIcon className="h-4 w-4 text-green-500" /> صورة
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 font-semibold rounded-full"
                                onClick={() => fileRef.current?.click()}>
                                <PlayCircle className="h-4 w-4 text-red-500" /> فيديو (Reels)
                            </Button>
                            <div className="flex-1" />
                            <Button className={cn("text-white gap-2 rounded-full px-6", isPharmacy ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-600 hover:bg-blue-700")}
                                onClick={handleSubmit} disabled={saving}>
                                {saving ? 'جاري النشر...' : 'نشر'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Posts List */}
            {loading ? (
                <div className="space-y-6 max-w-2xl mx-auto">
                    {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
                </div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-slate-200 rounded-3xl max-w-2xl mx-auto">
                    <Tag className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <p className="font-bold text-xl text-slate-700">لا توجد منشورات حتى الآن</p>
                    <p className="text-sm mt-2">ابدأ بمشاركة آخر الأخبار والتخفيضات</p>
                    <Button variant="outline" className={cn("mt-6 rounded-full", isPharmacy ? "border-teal-200 text-teal-600" : "border-blue-200 text-blue-600")} onClick={() => setShowForm(true)}>
                        إنشاء أول منشور
                    </Button>
                </div>
            ) : (
                <div className="space-y-8 max-w-2xl mx-auto pb-10">
                    {offers.map(offer => {
                        const isVid = checkIsVideo(offer.image);
                        const isOwn = currentUserId != null && offer.user?.id === currentUserId;
                        return (
                        <Card key={offer.id} className={cn(
                            "overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white rounded-sm transition-all duration-500 relative",
                            offer.isSponsored
                                ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50/40 to-orange-50/20"
                                : "border border-orange-500"
                        )}>
                            {/* Sponsored badge ribbon */}
                            {offer.isSponsored && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black">
                                    <Megaphone className="h-3.5 w-3.5" />
                                    إعلان ممول
                                    {offer.sponsorName && <span className="opacity-80">· {offer.sponsorName}</span>}
                                </div>
                            )}
                            <CardContent className="p-0">
                                {/* ── Post Header ───────────────── */}
                                <div className="flex items-start justify-between p-3.5 sm:p-4 pb-2.5">
                                    <div className="flex items-center gap-3">
                                        {/* AVATAR STACK */}
                                        <div className="relative flex-shrink-0">
                                            <div className={cn("absolute inset-0 rounded-full blur-[4px] opacity-50", offer.isSponsored ? "bg-gradient-to-tr from-amber-400 to-orange-500" : "bg-gradient-to-tr from-orange-500 to-blue-600")} />
                                            <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white p-0.5 z-10">
                                                <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                                    {offer.isSponsored ? (
                                                        offer.sponsorLogo ? (
                                                            <img src={logoSrc(offer.sponsorLogo) || ''} className="h-full w-full object-contain p-1" alt="sponsor" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-amber-500" />
                                                        )
                                                    ) : (
                                                        offer.user?.avatar ? (
                                                            <img src={logoSrc(offer.user.avatar) || ''} className="h-full w-full object-cover" alt="doctor" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-blue-800" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {!offer.isSponsored && offer.user?.clinic_logo && (
                                                <div className="absolute -bottom-0.5 -left-0.5 z-20 h-5 w-5 rounded-full border border-white shadow-md overflow-hidden bg-white">
                                                    <img src={logoSrc(offer.user.clinic_logo) || ''} alt="clinic" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        {offer.isSponsored ? (
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="font-extrabold text-slate-900 text-sm sm:text-base truncate leading-tight">
                                                        {offer.sponsorName || 'إعلان ممول'}
                                                    </p>
                                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-1.5 py-0 text-[9px] font-black gap-1 rounded-full shadow-xs">
                                                        <Star className="h-2 w-2 fill-amber-500 text-amber-500" /> جهة راعية
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                    </p>
                                                    {offer.sponsorPhone && (
                                                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 dir-ltr">
                                                            <Phone className="h-2.5 w-2.5 text-slate-400" />
                                                            {offer.sponsorPhone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-extrabold text-slate-900 text-sm sm:text-base truncate leading-tight">
                                                        {displayName(offer.user)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center flex-wrap gap-2 text-[10px] mt-1">
                                                    <p className="text-slate-400 flex items-center gap-0.5 font-medium">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isOwn && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(offer.id); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="px-3.5 sm:px-4 pb-2.5 cursor-text">
                                    <h3 className="font-black text-base sm:text-lg mb-1 text-blue-950 leading-snug">{offer.title}</h3>
                                    <div className="relative">
                                        <p className={cn(
                                            "text-xs sm:text-sm text-slate-700 leading-normal whitespace-pre-wrap font-medium transition-all duration-300",
                                            !expandedPosts[offer.id] && "line-clamp-3"
                                        )}>
                                            {offer.content}
                                        </p>
                                        {(offer.content && (offer.content.length > 120 || offer.content.split('\n').length > 3)) && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(offer.id);
                                                }}
                                                className="mt-1 text-xs font-black text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-0.5 focus:outline-none transition-colors"
                                            >
                                                {expandedPosts[offer.id] ? 'عرض أقل' : '... المزيد'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Media Container */}
                                {offer.image && (
                                    <div className="w-full bg-slate-950/5 border-y border-slate-100 flex items-center justify-center overflow-hidden">
                                        {isVid ? (
                                            <video src={logoSrc(offer.image) || ''} controls className="w-full max-h-[500px] object-contain bg-black" 
                                                onClick={(e) => e.stopPropagation()}
                                                onPointerDown={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <img
                                                src={logoSrc(offer.image) || ''}
                                                alt={offer.title}
                                                className="w-full max-h-[550px] object-cover md:object-contain"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Likes Count Summary */}
                                {(offer._count?.likes || 0) > 0 && (
                                    <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50/60">
                                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-xs">
                                            <Heart className="h-2.5 w-2.5 text-white fill-white" />
                                        </div>
                                        <span className="text-slate-700 font-bold">{offer._count?.likes || 0} شخص أعجبهم هذا</span>
                                    </div>
                                )}

                                {/* Action Buttons Bar */}
                                <div className="flex items-center border-t border-slate-100 bg-slate-50/80 overflow-hidden relative z-20">
                                    {/* Like Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(offer.id);
                                        }}
                                        className={cn(
                                            "flex-1 flex flex-col justify-center items-center gap-0.5 py-2 min-w-0 text-[10px] font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 border-r border-slate-100 hover:bg-slate-100",
                                            offer.isLikedByMe || offer.isLiked
                                                ? "text-orange-600"
                                                : "text-slate-500"
                                        )}
                                    >
                                        <Heart className={cn("h-4 w-4", (offer.isLikedByMe || offer.isLiked) ? "fill-orange-500 text-orange-500" : "text-slate-400")} />
                                        <span>{(offer.isLikedByMe || offer.isLiked) ? 'أعجبني' : 'إعجاب'}</span>
                                    </button>

                                    {/* Comments Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOfferForComments(offer);
                                        }}
                                        className="flex-1 flex flex-col justify-center items-center gap-0.5 py-2 min-w-0 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer select-none active:scale-95 border-r border-slate-100"
                                    >
                                        <MessageCircle className="h-4 w-4 text-slate-400" />
                                        <span>تعليق ({offer._count?.comments || 0})</span>
                                    </button>

                                    {/* Share Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare(offer);
                                        }}
                                        className="flex-1 flex flex-col justify-center items-center gap-0.5 py-2 min-w-0 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer select-none active:scale-95"
                                    >
                                        <Share2 className="h-4 w-4 text-slate-400" />
                                        <span>مشاركة</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="px-4 py-3 bg-slate-50/50">

                                    {offer.comments && offer.comments.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            {offer.comments.slice(0, 1).map(comment => (
                                                <div 
                                                    key={comment.id} 
                                                    className="flex gap-2.5 cursor-pointer"
                                                    onClick={() => setSelectedOfferForComments(offer)}
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                        {comment.user.avatar ? (
                                                            <img src={logoSrc(comment.user.avatar) || ''} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-xs">
                                                                {comment.user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-none px-3 py-2 shadow-sm">
                                                            <p className="font-bold text-xs text-slate-900">{comment.user.name}</p>
                                                            <p className="text-sm text-slate-700 mt-0.5">{comment.content}</p>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                                            {formatDistanceToNow(new Date(comment.createdAt), { locale: ar, addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {offer.comments.length > 1 && (
                                                <button 
                                                    onClick={() => setSelectedOfferForComments(offer)} 
                                                    className="text-xs text-blue-500 font-bold hover:underline mt-1 block"
                                                >
                                                    عرض كل التعليقات ({offer.comments.length})
                                                </button>
                                            )}
                                        </div>
                                    )}


                                </div>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            )}

            {/* Comments Modal */}
            <Dialog open={!!selectedOfferForComments} onOpenChange={(open) => !open && setSelectedOfferForComments(null)}>
                <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden" dir="rtl">
                    <DialogHeader className="px-4 py-3 border-b bg-slate-50/50">
                        <DialogTitle className="text-lg flex items-center gap-2 text-slate-800">
                            <MessageCircle className="h-5 w-5 text-blue-500" />
                            التعليقات
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                        {(!selectedOfferForComments?.comments || selectedOfferForComments.comments.length === 0) ? (
                            <div className="text-center py-8 text-slate-500">
                                لا توجد تعليقات بعد. كن أول من يعلق!
                            </div>
                        ) : (
                            selectedOfferForComments.comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                        {comment.user?.avatar ? (
                                            <img src={logoSrc(comment.user.avatar) || ''} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-xs">
                                                {comment.user?.name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tr-none px-3 py-2 shadow-sm inline-block min-w-[120px]">
                                            <p className="font-bold text-[13px] text-slate-900">{comment.user?.name || 'مستخدم'}</p>
                                            <p className="text-[14px] text-slate-700 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 mr-2">
                                            {formatDistanceToNow(new Date(comment.createdAt), { locale: ar, addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-3 bg-white border-t flex items-center gap-2 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                        <Input 
                            placeholder="اكتب تعليقك هنا..."
                            value={selectedOfferForComments ? (commentText[selectedOfferForComments.id] || '') : ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [selectedOfferForComments!.id]: e.target.value }))}
                            className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 px-4"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(selectedOfferForComments!.id);
                            }}
                        />
                        <Button 
                            size="icon"
                            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-shrink-0"
                            onClick={() => handleAddComment(selectedOfferForComments!.id)}
                            disabled={!selectedOfferForComments || postingComment[selectedOfferForComments.id] || !(commentText[selectedOfferForComments.id]?.trim())}
                        >
                            <Send className="h-4 w-4" dir="ltr" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
