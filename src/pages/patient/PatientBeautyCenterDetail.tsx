import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Sparkles, MapPin, Phone, Clock, Star, ArrowRight,
    MessageCircle, Share2, ChevronRight, CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/lib/api';
import PatientHero from '@/components/patient/PatientHero';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cosmetic service icons mapping
const SERVICE_ICONS: Record<string, string> = {
    'ليزر': '🔴',
    'بوتوكس': '💉',
    'فيلر': '💋',
    'تقشير': '✨',
    'تنظيف': '🧴',
    'كيماوي': '⚗️',
    'مقشر': '🌿',
    'هايدرا': '💧',
    'بلازما': '⚡',
    'كولاجين': '🩺',
    'تفتيح': '☀️',
    'نضارة': '🌸',
};

function getServiceIcon(name: string, icon?: string): string {
    if (icon) return icon;
    for (const [key, emoji] of Object.entries(SERVICE_ICONS)) {
        if (name.includes(key)) return emoji;
    }
    return '✨';
}

function formatArabicTime(timeStr: string) {
    if (!timeStr || !timeStr.includes('-')) return timeStr;
    const parts = timeStr.split('-');
    const formatPart = (t: string) => {
        const [hStr, mStr] = t.trim().split(':');
        if (!hStr || !mStr) return t;
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'مساءً' : 'صباحاً';
        if (h === 0) h = 12;
        else if (h > 12) h -= 12;
        return `${h.toString().padStart(2, '0')}:${mStr} ${ampm}`;
    };
    try {
        return `${formatPart(parts[0])} - ${formatPart(parts[1])}`;
    } catch {
        return timeStr;
    }
}

interface BeautyService {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    price?: string;
    duration?: number;
}

interface BeautyCenter {
    id: number;
    clinic_name?: string;
    name?: string;
    clinic_specialty?: string;
    clinic_address?: string;
    clinic_phone?: string;
    clinic_logo?: string;
    clinic_cover?: string;
    clinic_description?: string;
    working_hours?: string;
    location_url?: string;
    avgRating?: number;
    totalReviews?: number;
    beautyServices?: BeautyService[];
}

export default function PatientBeautyCenterDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [center, setCenter] = useState<BeautyCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<BeautyService | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);

    useEffect(() => {
        if (id) fetchCenter(parseInt(id));
    }, [id]);

    const fetchCenter = async (centerId: number) => {
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/beauty-centers/${centerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            setCenter(res.data);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل بيانات المركز' });
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        const phone = center?.clinic_phone;
        if (phone) window.open(`tel:${phone}`, '_self');
    };

    const handleWhatsApp = () => {
        const phone = center?.clinic_phone?.replace(/\D/g, '');
        if (phone) window.open(`https://wa.me/${phone}`, '_blank');
    };

    const handleShare = async () => {
        const name = center?.clinic_name || center?.name || 'مركز تجميل';
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: name, url });
        } else {
            navigator.clipboard.writeText(url);
            toast({ title: '✅ تم نسخ الرابط' });
        }
    };

    const handleMap = () => {
        const { location_url, clinic_address } = center || {};
        if (location_url) window.open(location_url, '_blank');
        else if (clinic_address) window.open(`https://maps.google.com/?q=${encodeURIComponent(clinic_address)}`, '_blank');
    };

    const logoSrc = () => {
        const raw = center?.clinic_logo;
        if (!raw) return null;
        return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
    };

    if (loading) {
        return (
            <div className="space-y-4 p-4 animate-fade-in">
                <Skeleton className="h-52 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!center) return null;

    const displayName = center.clinic_name || center.name || 'مركز تجميل';
    const logo = logoSrc();
    const services = center.beautyServices || [];

    return (
        <div className="pb-24 animate-fade-in" dir="rtl">
            {/* ── Hero Section — Facebook Style ── */}
            <div className="relative">

                {/* ── Cover Photo (Top) ── */}
                <div className="relative h-48 overflow-hidden">
                    {center.clinic_cover ? (
                        <img
                            src={center.clinic_cover.startsWith('http') ? center.clinic_cover : `${BASE_URL}${center.clinic_cover.startsWith('/') ? '' : '/'}${center.clinic_cover}`}
                            alt="cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-rose-500" />
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)'
                            }} />
                        </>
                    )}
                    {/* Dark overlay for readability of buttons */}
                    <div className="absolute inset-0 bg-black/20" />

                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 right-4 z-10 flex items-center gap-1 text-white font-bold text-sm bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full transition-all hover:bg-black/50"
                    >
                        <ArrowRight className="w-4 h-4" />
                        رجوع
                    </button>

                    {/* Share */}
                    <button
                        onClick={handleShare}
                        className="absolute top-4 left-4 z-10 text-white bg-black/30 backdrop-blur-sm p-2 rounded-full transition-all hover:bg-black/50"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Info Card (below cover) ── */}
                <div className="relative bg-white dark:bg-slate-900 px-4 pt-0 pb-4 shadow-sm">
                    {/* Floating Logo — overlapping cover bottom edge */}
                    <div className="absolute -top-10 right-4 z-20">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 blur-[6px] opacity-60" />
                            <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                                {logo ? (
                                    <img src={logo} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                        <Sparkles className="w-8 h-8 text-pink-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Clinic Info — pushed right to leave space for logo */}
                    <div className="pt-3 pr-28">
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{displayName}</h1>
                        {center.clinic_specialty && (
                            <p className="text-xs text-pink-600 font-semibold mt-0.5">{center.clinic_specialty}</p>
                        )}
                    </div>

                    {/* Rating + Hours row below logo */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {(center.totalReviews ?? 0) > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(center.avgRating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                    ))}
                                </div>
                                <span className="text-amber-700 text-xs font-bold">{center.avgRating}</span>
                                <span className="text-slate-400 text-[10px]">({center.totalReviews})</span>
                            </div>
                        )}
                        {center.working_hours && (
                            <span className="flex items-center gap-1 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full text-[11px] font-semibold text-purple-700">
                                <Clock className="w-3 h-3" />
                                {formatArabicTime(center.working_hours)}
                            </span>
                        )}
                        {center.clinic_address && (
                            <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 truncate max-w-[160px]">
                                <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                                {center.clinic_address}
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 w-full">
                        <Button size="sm" variant="outline"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs border-pink-200 text-pink-600 hover:bg-pink-50"
                            onClick={handleMap}>
                            <MapPin className="h-3.5 w-3.5 shrink-0" />الموقع
                        </Button>
                        <Button size="sm"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs bg-[#25D366] hover:bg-green-600 text-white border-0"
                            onClick={handleWhatsApp}>
                            <MessageCircle className="h-3.5 w-3.5 shrink-0" />واتساب
                        </Button>
                        <Button size="sm"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs bg-pink-500 hover:bg-pink-600 text-white border-0"
                            onClick={handleCall}>
                            <Phone className="h-3.5 w-3.5 shrink-0" />اتصال
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6 pt-4 pb-28">

                {/* ── Description ── */}
                {center.clinic_description && (
                    <Card className="border-pink-100 shadow-sm">
                        <CardContent className="p-4">
                            <h2 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                عن المركز
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">{center.clinic_description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* ── Services List ── */}
                <div id="services-section" className="pb-8">
                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-pink-500" />
                        خدمات التجميل والعناية
                    </h2>

                    {services.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500 font-medium">لم يتم إضافة خدمات بعد</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {services.map((service) => {
                                const isSelected = selectedService?.id === service.id;
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(isSelected ? null : service)}
                                        className={`relative text-right p-4 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                                            isSelected
                                                ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md shadow-pink-200/50'
                                                : 'border-slate-100 bg-white hover:border-pink-200 hover:shadow-sm'
                                        }`}
                                    >
                                        {isSelected && (
                                            <CheckCircle2 className="absolute top-2 left-2 w-4 h-4 text-pink-500" />
                                        )}
                                        <div className="text-2xl mb-2">{getServiceIcon(service.name, service.icon)}</div>
                                        <p className="font-bold text-sm text-slate-800 leading-tight">{service.name}</p>
                                        {service.description && (
                                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{service.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            {service.price && (
                                                <span className="text-xs font-black text-pink-600">{service.price}</span>
                                            )}
                                            {service.duration && (
                                                <span className="text-[10px] text-slate-400 font-medium">{service.duration} دقيقة</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Floating Book Button ── */}
            <div className="fixed bottom-[65px] left-0 right-0 p-4 bg-white/85 backdrop-blur-md border-t border-pink-100 shadow-[0_-10px_20px_-10px_rgba(236,72,153,0.15)] z-50 animate-fade-in-up">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <Button
                        onClick={() => {
                            if (!selectedService && services.length > 0) {
                                toast({ title: 'اختر الخدمة أولاً', description: 'يرجى اختيار نوع الخدمة قبل الحجز', variant: 'default' });
                                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                                return;
                            }
                            navigate(`/clinic/${id}/${encodeURIComponent(displayName.replace(/\s+/g, '-'))}${selectedService ? `?service=${encodeURIComponent(selectedService.name)}` : ''}`);
                        }}
                        className={`w-full h-14 text-base font-black rounded-2xl text-white transition-all duration-300 shadow-lg ${
                            selectedService 
                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-800 hover:bg-slate-700 active:scale-95'
                        }`}
                    >
                        <Sparkles className={`w-5 h-5 ml-2 ${selectedService ? 'animate-pulse text-yellow-300' : 'text-pink-300'}`} />
                        {selectedService ? `احجز جلسة ${selectedService.name}` : 'احجز موعدك الآن'}
                        <ChevronRight className="w-5 h-5 mr-auto" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
