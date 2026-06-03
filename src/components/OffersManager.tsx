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
    Building2, Heart, X, Sparkles, MessageCircle, Send, PlayCircle, Share2, Pill
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
    const [postingComment, setPostingComment] = useState<{ [key: number]: boolean }>({});
    const [selectedOfferForComments, setSelectedOfferForComments] = useState<Offer | null>(null);

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
                        <Card key={offer.id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl">
                            <CardContent className="p-0">
                                {/* Header */}
                                <div className="flex items-start justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-12 w-12 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden",
                                            isPharmacy
                                                ? "bg-gradient-to-br from-teal-100 to-teal-50"
                                                : "bg-gradient-to-br from-blue-100 to-orange-50"
                                        )}>
                                            {offer.user?.avatar ? (
                                                <img src={logoSrc(offer.user.avatar) || ''} alt="avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <Building2 className={cn("h-6 w-6", isPharmacy ? "text-teal-800" : "text-blue-800")} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-slate-900 leading-tight">{displayName(offer.user)}</p>
                                            <p className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                • <Clock className="h-3 w-3" />
                                            </p>
                                        </div>
                                    </div>
                                    {isOwn && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                                            onClick={() => handleDelete(offer.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="px-4 pb-3">
                                    <h3 className="font-bold text-base mb-1 text-slate-900">{offer.title}</h3>
                                    <p className="text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">{offer.content}</p>
                                </div>

                                {/* Media */}
                                {offer.image && (
                                    <div className="w-full bg-slate-50 border-y border-slate-100">
                                        {isVid ? (
                                            <video src={logoSrc(offer.image) || ''} controls className="w-full max-h-[500px] object-contain bg-black" />
                                        ) : (
                                            <img src={logoSrc(offer.image) || ''} alt="post" className="w-full max-h-[500px] object-cover" />
                                        )}
                                    </div>
                                )}

                                {/* Action Bar */}
                                <div className="px-4 py-3 bg-slate-50 border-y border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <button
                                            onClick={() => handleLike(offer.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 transition-colors",
                                                isPharmacy
                                                    ? (offer.isLikedByMe || offer.isLiked ? "text-teal-500" : "text-slate-500 hover:text-teal-500")
                                                    : (offer.isLikedByMe || offer.isLiked ? "text-orange-500" : "text-slate-500 hover:text-orange-500")
                                            )}
                                        >
                                            <Heart className={cn("h-4 w-4", (offer.isLikedByMe || offer.isLiked) && isPharmacy ? "fill-teal-500" : (offer.isLikedByMe || offer.isLiked) && "fill-orange-500")} />
                                            <span>{offer._count?.likes || 0} إعجاب</span>
                                        </button>
                                        <div 
                                            className="flex items-center gap-1.5 text-slate-500 cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={() => setSelectedOfferForComments(offer)}
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>{offer._count?.comments || 0} تعليق</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleShare(offer)}
                                        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        مشاركة
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
