import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Tag, Heart, Share2, MessageCircle,
    Building2, Calendar, Infinity, Clock, Phone, Stethoscope
} from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PatientHero from '@/components/patient/PatientHero';
import { BASE_URL } from '@/lib/api';

const logoSrc = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
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
}

export default function PatientOffers() {
    const { toast } = useToast();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleLike = async (offer: Offer) => {
        // Optimistic UI
        setOffers(prev => prev.map(o => o.id === offer.id ? {
            ...o,
            isLikedByMe: !o.isLikedByMe,
            likesCount: o.isLikedByMe ? o.likesCount - 1 : o.likesCount + 1,
        } : o));

        try {
            await axios.post(`${API_URL}/patient/offers/${offer.id}/like`, {}, { headers });
        } catch {
            // Revert on error
            setOffers(prev => prev.map(o => o.id === offer.id ? {
                ...o,
                isLikedByMe: offer.isLikedByMe,
                likesCount: offer.likesCount,
            } : o));
        }
    };

    const handleShare = (offer: Offer) => {
        if (navigator.share) {
            navigator.share({
                title: offer.title,
                text: `${offer.title}\n\n${offer.content}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(`${offer.title}\n\n${offer.content}`);
            toast({ title: '📋 تم نسخ العرض!' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-28 bg-slate-50 min-h-screen" dir="rtl">
            {/* Hero */}
            <PatientHero
                title="عروض وتخفيضات"
                subtitle="من عياداتكم المفضلة"
                description="تصفح أحدث العروض والتخفيضات المقدمة من العيادات المسجلة."
                badgeText="عروض حصرية"
            />

            <div className="px-4 sm:px-0 max-w-3xl mx-auto">
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
                        <p className="font-bold text-xl text-slate-800">لا توجد عروض حالياً</p>
                        <p className="text-sm mt-2 text-slate-500">تابع العيادات لتصلك أحدث عروضها الحصرية</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {offers.map(offer => (
                            <Card key={offer.id}
                                className="overflow-hidden border border-orange-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white rounded-sm transition-all duration-500 relative">
                                <CardContent className="p-0">
                                    {/* ── Post Header ───────────────── */}
                                    <div className="flex items-start justify-between p-5 pb-4">
                                        <div className="flex items-center gap-4">
                                            {/* AVATAR STACK: Doctor + Clinic Logo badge */}
                                        <div className="relative flex-shrink-0">
                                            {/* Glow ring */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full blur-[5px] opacity-60" />
                                            {/* Doctor avatar */}
                                            <div className="relative h-14 w-14 rounded-full bg-white p-0.5 z-10">
                                                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                                    {offer.user.avatar
                                                        ? <img src={logoSrc(offer.user.avatar) || ''} className="h-full w-full object-cover" alt="doctor" />
                                                        : <Building2 className="h-6 w-6 text-blue-800" />
                                                    }
                                                </div>
                                            </div>
                                            {/* Clinic logo mini-badge */}
                                            {offer.user.clinic_logo && (
                                                <div className="absolute -bottom-1 -left-1 z-20 h-6 w-6 rounded-full border-2 border-white shadow-md overflow-hidden bg-white">
                                                    <img src={logoSrc(offer.user.clinic_logo) || ''} alt="clinic" className="h-full w-full object-cover" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                            {/* Line 1: Doctor Name & Badge */}
                                            <div className="flex items-center gap-2">
                                                <p className="font-extrabold text-slate-900 text-[16px] truncate leading-none">
                                                    {offer.user.name || 'طبيب'}
                                                </p>
                                                {offer.isPermanent && (
                                                    <Badge className="bg-orange-100/80 text-orange-700 border-0 px-2 py-0 text-[10px] uppercase font-black tracking-wider rounded-sm shadow-sm">
                                                        دائم
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Line 2: Clinic Logo + Clinic Name */}
                                            <div className="flex items-center gap-1.5 py-0.5">
                                                {offer.user.clinic_logo ? (
                                                    <img src={logoSrc(offer.user.clinic_logo) || ''} alt="clinic" className="w-[18px] h-[18px] rounded-full object-cover border border-slate-200 shadow-sm" />
                                                ) : (
                                                    <div className="w-[18px] h-[18px] rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600">
                                                        <Building2 className="w-2.5 h-2.5" />
                                                    </div>
                                                )}
                                                <span className="text-[13px] font-bold text-blue-800 truncate">
                                                    {offer.user.clinic_name || 'العيادة'}
                                                </span>
                                            </div>

                                            {/* Line 3: Specialty & Time Info */}
                                            <div className="flex items-center flex-wrap gap-3">
                                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                                                    <Stethoscope className="h-[10px] w-[10px] text-orange-500" />
                                                    <span className="text-[11px] font-bold text-slate-500 truncate max-w-[140px]">
                                                        {offer.user.clinic_specialty || offer.user.clinic_description || 'تخصص عام'}
                                                    </span>
                                                </div>

                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium italic">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(offer.createdAt), { locale: ar, addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        </div>
                                        
                                        {/* Expiry Badge if not permanent */}
                                        {!offer.isPermanent && offer.endDate && (
                                            <div className="flex flex-col items-end">
                                               <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60 gap-1.5 text-xs px-2.5 py-1 rounded-sm font-medium">
                                                   <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                                   ينتهي {formatDistanceToNow(new Date(offer.endDate), { locale: ar, addSuffix: true })}
                                               </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* ── Post Content ──────────────── */}
                                    <div className="px-6 pb-4 cursor-text">
                                        <h3 className="font-black text-xl mb-3 text-blue-900 leading-tight">
                                            {offer.title}
                                        </h3>
                                        <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                            {offer.content}
                                        </p>
                                    </div>

                                    {/* ── Image & Stats Container ─────────────────────── */}
                                    <div className="relative">
                                        {offer.image && (
                                            <div className="w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-100 relative">
                                                <img
                                                    src={logoSrc(offer.image) || ''}
                                                    alt={offer.title}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}

                                        {offer.likesCount > 0 && !offer.image && (
                                           <div className="px-6 py-3 border-y border-slate-100 text-xs text-slate-500 flex items-center gap-2 font-medium bg-slate-50">
                                               <div className="h-5 w-5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
                                                   <Heart className="h-3 w-3 text-white fill-white" />
                                               </div>
                                               <span className="text-slate-700">{offer.likesCount} شخص أعجبهم هذا</span>
                                           </div>
                                        )}

                                        {/* ── Glassmorphism Action Bar ─────────────── */}
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-3",
                                            offer.image 
                                                ? "absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-lg border-t border-white/40 shadow-lg"
                                                : "bg-slate-50 border-t border-slate-200"
                                        )}>
                                            {offer.image && offer.likesCount > 0 && (
                                                <div className="absolute -top-8 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md text-[10px] font-bold text-orange-600 flex items-center gap-1 border border-white/50">
                                                    <Heart className="h-3 w-3 fill-orange-500" />
                                                    {offer.likesCount}
                                                </div>
                                            )}

                                            {/* Like */}
                                            <button
                                                onClick={() => handleLike(offer)}
                                                className={cn(
                                                    "flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300",
                                                    offer.isLikedByMe
                                                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                                                        : offer.image 
                                                            ? "bg-white/50 text-slate-700 border border-white/60 hover:bg-white/80"
                                                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <Heart className={cn("h-3.5 w-3.5 transition-transform duration-300", offer.isLikedByMe ? "fill-white scale-110" : "scale-100")} />
                                                {offer.isLikedByMe ? 'أعجبني' : 'إعجاب'}
                                            </button>

                                            {/* Message (Chat) */}
                                            <Link
                                                to={`/patient/chat/${offer.user.id}`}
                                                className={cn(
                                                    "flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300",
                                                    offer.image
                                                        ? "bg-blue-600/90 text-white shadow-sm hover:bg-blue-700"
                                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                                )}
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                مراسلة
                                            </Link>

                                            {/* Share */}
                                            <button
                                                onClick={() => handleShare(offer)}
                                                className={cn(
                                                    "flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300",
                                                    offer.image
                                                        ? "bg-white/50 text-slate-700 border border-white/60 hover:bg-white/80"
                                                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <Share2 className="h-3.5 w-3.5" />
                                                مشاركة
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
