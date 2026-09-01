import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Tag, Heart, Share2, MessageCircle,
    Building2, Calendar, Infinity, Clock, Phone, Stethoscope, X, Send, Star, Megaphone
} from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PatientHero from '@/components/patient/PatientHero';
import { BASE_URL } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const logoSrc = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Offer {
    id: number;
    title: string;
    content: string;
    image?: string;
    isPermanent: boolean;
    startDate: string;
    endDate?: string;
    createdAt: string;
    likesCount: number;
    isLikedByMe: boolean;
    isSponsored?: boolean;
    sponsorName?: string;
    sponsorLogo?: string;
    sponsorPhone?: string;
    user: {
        id: number;
        clinic_name: string;
        name: string;
        avatar?: string;
        clinic_specialty: string;
        clinic_description?: string;
        clinic_logo?: string;
        phone?: string;
    };
    comments?: any[];
}

export default function PatientOffers() {
    const { toast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOfferForComments, setSelectedOfferForComments] = useState<Offer | null>(null);
    const [commentText, setCommentText] = useState('');
    const [postingComment, setPostingComment] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) => {
        setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const token = localStorage.getItem('patient_token');
    const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };

    const fetchOffers = async () => {
        try {
            const res = await axios.get(`${API_URL}/patient/offers/feed`, { headers });
            setOffers(Array.isArray(res.data) ? res.data : []);
        } catch {
            setOffers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleLike = async (offer: any) => {
        try {
            const res = await axios.post(`${API_URL}/patient/offers/${offer.id}/like`, {}, { headers });
            setOffers(prev => prev.map(o => {
                if (o.id === offer.id) {
                    const isNowLiked = res.data.liked;
                    return {
                        ...o,
                        isLikedByMe: isNowLiked,
                        likesCount: isNowLiked ? o.likesCount + 1 : Math.max(0, o.likesCount - 1)
                    };
                }
                return o;
            }));
        } catch {
            toast({ variant: 'destructive', title: 'حدث خطأ' });
        }
    };

    const handleAddComment = async (offerId: number) => {
        if (!commentText.trim()) return;
        setPostingComment(true);
        try {
            const res = await axios.post(`${API_URL}/patient/offers/${offerId}/comments`, { content: commentText }, { headers });
            const newComment = res.data;
            
            setOffers(prev => prev.map(o => {
                if (o.id === offerId) {
                    return { ...o, comments: [...(o.comments || []), newComment] };
                }
                return o;
            }));
            
            if (selectedOfferForComments?.id === offerId) {
                setSelectedOfferForComments(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev);
            }
            
            setCommentText('');
            toast({ title: 'تمت إضافة التعليق' });
        } catch {
            toast({ variant: 'destructive', title: 'فشل إضافة التعليق' });
        } finally {
            setPostingComment(false);
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
            }).catch(() => { });
        } else {
            // Fallback for desktop: Open WhatsApp web
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + url)}`;
            window.open(whatsappUrl, '_blank');
            toast({ title: 'تم الفتح في واتساب!' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-28 bg-slate-50 min-h-screen pt-4 w-full" dir="rtl">
            <div className="w-full">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-[400px] w-full rounded-md border border-orange-500" />
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-md border border-orange-500 shadow-sm text-muted-foreground w-full">
                        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Tag className="h-10 w-10 text-blue-400 opacity-80" />
                        </div>
                        <p className="font-bold text-xl text-slate-800">لا توجد أخبار حالياً</p>
                        <p className="text-sm mt-2 text-slate-500">تابع العيادات لتصلك أحدث أخبارها</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {offers.map(offer => (
                            <Card key={offer.id}
                                className={cn(
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
                                        {/* AVATAR STACK: Doctor/Sponsor Logo */}
                                        <div className="relative flex-shrink-0">
                                            {/* Glow ring */}
                                            <div className={cn("absolute inset-0 rounded-full blur-[4px] opacity-50", offer.isSponsored ? "bg-gradient-to-tr from-amber-400 to-orange-500" : "bg-gradient-to-tr from-orange-500 to-blue-600")} />
                                            {/* Avatar */}
                                            <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white p-0.5 z-10">
                                                <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                                    {offer.isSponsored ? (
                                                        offer.sponsorLogo ? (
                                                            <img src={logoSrc(offer.sponsorLogo) || ''} className="h-full w-full object-contain p-1" alt="sponsor" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-amber-500" />
                                                        )
                                                    ) : (
                                                        offer.user.avatar ? (
                                                            <img src={logoSrc(offer.user.avatar) || ''} className="h-full w-full object-cover" alt="doctor" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-blue-800" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            {/* Clinic logo mini-badge (only for non-sponsored) */}
                                            {!offer.isSponsored && offer.user.clinic_logo && (
                                                <div className="absolute -bottom-0.5 -left-0.5 z-20 h-5 w-5 rounded-full border border-white shadow-md overflow-hidden bg-white">
                                                    <img src={logoSrc(offer.user.clinic_logo) || ''} alt="clinic" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        {offer.isSponsored ? (
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                {/* Line 1: Sponsor Company Name */}
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="font-extrabold text-slate-900 text-sm sm:text-base truncate leading-tight">
                                                        {offer.sponsorName || 'إعلان ممول'}
                                                    </p>
                                                    <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-1.5 py-0 text-[9px] font-black gap-1 rounded-full shadow-xs">
                                                        <Star className="h-2 w-2 fill-amber-500 text-amber-500" /> جهة راعية
                                                    </Badge>
                                                    {offer.isPermanent && (
                                                        <Badge className="bg-orange-100/80 text-orange-700 border-0 px-1.5 py-0 text-[9px] uppercase font-black tracking-wider rounded-xs">
                                                            دائم
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Line 2: Contact / Commercial Notice */}
                                                <div className="flex items-center gap-2 text-[11px] text-amber-700 font-medium">
                                                    <span className="flex items-center gap-0.5">
                                                        <Building2 className="w-3 h-3 text-amber-500" /> إعلان رسمي
                                                    </span>
                                                    {offer.sponsorPhone && (
                                                        <span className="text-[10px] font-bold text-slate-500 dir-ltr">
                                                            • {offer.sponsorPhone}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Line 3: Timestamp */}
                                                <p className="text-[9px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                {/* Line 1: Doctor Name & Badge */}
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-extrabold text-slate-900 text-sm sm:text-base truncate leading-tight">
                                                        {offer.user.name || 'طبيب'}
                                                    </p>
                                                    {offer.isPermanent && (
                                                        <Badge className="bg-orange-100/80 text-orange-700 border-0 px-1.5 py-0 text-[9px] uppercase font-black tracking-wider rounded-xs">
                                                            دائم
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Line 2: Clinic Logo + Clinic Name */}
                                                <div className="flex items-center gap-1 py-0.5">
                                                    {offer.user.clinic_logo ? (
                                                        <img src={logoSrc(offer.user.clinic_logo) || ''} alt="clinic" className="w-3.5 h-3.5 rounded-full object-cover border border-slate-200" />
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                            <Building2 className="w-2 h-2" />
                                                        </div>
                                                    )}
                                                    <span className="text-xs font-bold text-blue-800 truncate">
                                                        {offer.user.clinic_name || 'العيادة'}
                                                    </span>
                                                </div>

                                                {/* Line 3: Specialty & Time Info */}
                                                <div className="flex items-center flex-wrap gap-2 text-[10px]">
                                                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-1 py-0.2 rounded text-slate-600 font-medium">
                                                        <Stethoscope className="h-2.5 w-2.5 text-orange-500" />
                                                        <span className="truncate max-w-[120px]">
                                                            {offer.user.clinic_specialty || offer.user.clinic_description || 'تخصص عام'}
                                                        </span>
                                                    </div>

                                                    <p className="text-slate-400 flex items-center gap-0.5 font-medium">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        </div>
                                        
                                        {/* Expiry Badge if not permanent */}
                                        {!offer.isPermanent && offer.endDate && (
                                            <div className="flex flex-col items-end">
                                               <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60 gap-1 text-[10px] px-2 py-0.5 rounded font-medium">
                                                   <Calendar className="h-3 w-3 text-orange-500" />
                                                   ينتهي {formatDistanceToNow(new Date(offer.endDate), { locale: ar, addSuffix: true })}
                                               </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Post Content ──────────────── */}
                                    <div className="px-3.5 sm:px-4 pb-2.5 cursor-text">
                                        <h3 className="font-black text-base sm:text-lg mb-1 text-blue-950 leading-snug">
                                            {offer.title}
                                        </h3>
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

                                        {/* ── Media Container ─────────────────────── */}
                                        {offer.image && (
                                            <div className="w-full bg-slate-950/5 border-y border-slate-100 flex items-center justify-center overflow-hidden">
                                                {offer.image.match(/\.(mp4|webm|ogg)$/i) || offer.image.startsWith('data:video/') ? (
                                                    <video src={logoSrc(offer.image) || ''} controls className="w-full max-h-[500px] object-contain bg-black" />
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
                                        {offer.likesCount > 0 && (
                                            <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50/60">
                                                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-xs">
                                                    <Heart className="h-2.5 w-2.5 text-white fill-white" />
                                                </div>
                                                <span className="text-slate-700 font-bold">{offer.likesCount} شخص أعجبهم هذا</span>
                                            </div>
                                        )}

                                        {/* ── Compact Action Buttons Bar ─────────────── */}
                                        <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-50/90 border-t border-slate-100 relative z-20">
                                            {/* Like Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(offer);
                                                }}
                                                className={cn(
                                                    "flex-1 flex justify-center items-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 border cursor-pointer select-none active:scale-95",
                                                    offer.isLikedByMe
                                                        ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50"
                                                )}
                                            >
                                                <Heart className={cn("h-3.5 w-3.5 transition-transform", offer.isLikedByMe ? "fill-white text-white" : "text-slate-600")} />
                                                <span className="truncate">{offer.isLikedByMe ? 'أعجبني' : 'إعجاب'}</span>
                                            </button>

                                            {/* Message (Chat) or WhatsApp for sponsored */}
                                            {offer.isSponsored && offer.sponsorPhone ? (
                                                <a
                                                    href={`https://wa.me/${offer.sponsorPhone.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 flex justify-center items-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 bg-green-600 hover:bg-green-700 text-white shadow-xs active:scale-95 cursor-pointer select-none"
                                                >
                                                    <svg className="h-3.5 w-3.5 fill-white flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.115 1.535 5.838L0 24l6.338-1.507A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.643-.492-5.17-1.349l-.371-.219-3.865.919.974-3.769-.24-.384A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                                    <span className="truncate">واتساب</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    to={`/patient/chat/${offer.user.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 flex justify-center items-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95 cursor-pointer select-none"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    <span className="truncate">مراسلة</span>
                                                </Link>
                                            )}

                                            {/* Comments Toggle Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOfferForComments(offer);
                                                }}
                                                className="flex-1 flex justify-center items-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs active:scale-95 cursor-pointer select-none"
                                            >
                                                <MessageCircle className="h-3.5 w-3.5 text-slate-600" />
                                                <span className="truncate">التعليقات</span>
                                            </button>

                                            {/* Share Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(offer);
                                                }}
                                                className="flex-1 flex justify-center items-center gap-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-xs active:scale-95 cursor-pointer select-none"
                                            >
                                                <Share2 className="h-3.5 w-3.5 text-slate-600" />
                                                <span className="truncate">مشاركة</span>
                                            </button>
                                        </div>

                                    {/* Comments Section */}
                                    {offer.comments && offer.comments.length > 0 && (
                                        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-3 text-slate-500 text-sm font-medium">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>التعليقات ({offer.comments.length})</span>
                                            </div>
                                            <div className="space-y-3">
                                                {offer.comments.slice(0, 1).map((comment: any) => (
                                                    <div 
                                                        key={comment.id} 
                                                        className="flex gap-2.5 cursor-pointer" 
                                                        onClick={() => setSelectedOfferForComments(offer)}
                                                    >
                                                        <div className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                            {comment.user.avatar ? (
                                                                <img src={logoSrc(comment.user.avatar) || ''} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-[10px]">
                                                                    {comment.user.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-white border border-slate-100 rounded-2xl rounded-tr-none px-3 py-2 shadow-sm">
                                                                <p className="font-bold text-[11px] text-slate-900">{comment.user.name}</p>
                                                                <p className="text-xs text-slate-700 mt-0.5">{comment.content}</p>
                                                            </div>
                                                            <p className="text-[9px] text-slate-400 mt-1 ml-1">
                                                                {formatDistanceToNow(new Date(comment.createdAt), { locale: ar, addSuffix: true })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {offer.comments.length > 1 && (
                                                    <button 
                                                        onClick={() => setSelectedOfferForComments(offer)} 
                                                        className="text-xs text-blue-500 font-bold hover:underline"
                                                    >
                                                        عرض كل التعليقات ({offer.comments.length})
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

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
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 rounded-full bg-slate-100 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 px-4"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(selectedOfferForComments!.id);
                            }}
                        />
                        <Button 
                            size="icon"
                            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-shrink-0"
                            onClick={() => handleAddComment(selectedOfferForComments!.id)}
                            disabled={postingComment || !commentText.trim()}
                        >
                            <Send className="h-4 w-4" dir="ltr" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
