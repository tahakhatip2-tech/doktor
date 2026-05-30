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
    Building2, Heart, X, Sparkles, MessageCircle, Send, PlayCircle
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

interface Offer {
    id: number;
    title: string;
    content: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    _count: { likes: number, comments: number };
    comments?: Comment[];
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
    const [isVideo, setIsVideo] = useState(false);

    const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
    const [postingComment, setPostingComment] = useState<{ [key: number]: boolean }>({});

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

    const checkIsVideo = (url: string | undefined) => {
        if (!url) return false;
        return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg)$/i);
    };

    return (
        <div className="space-y-6" dir="rtl">
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                    <Button className="fixed bottom-24 left-4 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-400 shadow-[0_8px_25px_rgba(249,115,22,0.4)] border-2 border-white dark:border-zinc-900 hover:scale-105 active:scale-95 transition-all duration-300 text-white p-0">
                        <Plus className="h-7 w-7" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] border-orange-200 shadow-xl bg-gradient-to-br from-white to-blue-50/50" dir="rtl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-900">
                                <Sparkles className="h-5 w-5 text-orange-500" />
                                إنشاء منشور جديد
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow">
                                    {user?.avatar ? (
                                        <img src={logoSrc(user.avatar) || ''} alt="avatar" className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        <Building2 className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800">{user?.clinic_name || user?.name}</p>
                                    <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-200 text-blue-600 bg-blue-50 mt-0.5">العيادة</Badge>
                                </div>
                            </div>

                            <Input
                                placeholder="عنوان المنشور..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="font-bold text-base border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-orange-500 bg-transparent placeholder:font-medium"
                            />
                            <Textarea
                                placeholder="بم تفكر؟ تفاصيل المنشور..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={4}
                                className="border-0 rounded-none px-0 focus-visible:ring-0 bg-transparent resize-none text-slate-700 text-base"
                            />

                            {/* Media Preview */}
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
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-full px-6"
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
                    <p className="text-sm mt-2">ابدأ بالتواصل مع مرضاك وشاركهم أخبارك</p>
                    <Button variant="outline" className="mt-6 rounded-full border-blue-200 text-blue-600" onClick={() => setShowForm(true)}>
                        إنشاء أول منشور
                    </Button>
                </div>
            ) : (
                <div className="space-y-8 max-w-2xl mx-auto pb-10">
                    {offers.map(offer => {
                        const isVid = checkIsVideo(offer.image);
                        return (
                        <Card key={offer.id} className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl">
                            <CardContent className="p-0">
                                {/* Header */}
                                <div className="flex items-start justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                                            {user?.avatar ? (
                                                <img src={logoSrc(user.avatar) || ''} alt="avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <Building2 className="h-6 w-6 text-blue-800" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-slate-900 leading-tight">{user?.clinic_name || user?.name}</p>
                                            <p className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                • <Clock className="h-3 w-3" />
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full"
                                        onClick={() => handleDelete(offer.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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

                                {/* Stats & Comments Section */}
                                <div className="px-4 py-3 bg-slate-50/50">
                                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mb-3 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <div className="bg-blue-100 p-1 rounded-full"><Heart className="h-3 w-3 text-blue-600 fill-blue-600" /></div>
                                            <span>{offer._count?.likes || 0} إعجاب</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageCircle className="h-4 w-4" />
                                            <span>{offer._count?.comments || 0} تعليق</span>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    {offer.comments && offer.comments.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            {offer.comments.map(comment => (
                                                <div key={comment.id} className="flex gap-2.5">
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
                                        </div>
                                    )}

                                    {/* Add Comment Input */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200 flex-shrink-0">
                                            {user?.avatar ? (
                                                <img src={logoSrc(user.avatar) || ''} alt="avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <Building2 className="h-4 w-4 text-blue-700" />
                                            )}
                                        </div>
                                        <div className="flex-1 relative">
                                            <Input 
                                                placeholder="اكتب تعليقاً..."
                                                value={commentText[offer.id] || ''}
                                                onChange={e => setCommentText(prev => ({ ...prev, [offer.id]: e.target.value }))}
                                                className="rounded-full bg-white border-slate-200 pr-4 pl-10 h-10 text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleAddComment(offer.id);
                                                }}
                                            />
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="absolute left-1 top-1 h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleAddComment(offer.id)}
                                                disabled={postingComment[offer.id] || !commentText[offer.id]?.trim()}
                                            >
                                                <Send className="h-4 w-4" dir="ltr" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            )}
        </div>
    );
}
