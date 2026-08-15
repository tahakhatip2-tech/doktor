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
            {/* ── Hero Section ── */}
            <div className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-rose-500" />
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)'
                }} />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 z-10 flex items-center gap-1 text-white/90 hover:text-white font-bold text-sm bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full transition-all hover:bg-white/30"
                >
                    <ArrowRight className="w-4 h-4" />
                    رجوع
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    className="absolute top-4 left-4 z-10 text-white/90 hover:text-white bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all hover:bg-white/30"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                <div className="relative z-10 px-5 pt-16 pb-10 text-white text-center">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/40 overflow-hidden bg-white/20 backdrop-blur-sm shadow-2xl">
                        {logo ? (
                            <img src={logo} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-black mb-1 drop-shadow-md">{displayName}</h1>
                    {center.clinic_specialty && (
                        <p className="text-pink-100 text-sm font-medium mb-3">{center.clinic_specialty}</p>
                    )}

                    {/* Rating */}
                    {(center.totalReviews ?? 0) > 0 && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(center.avgRating || 0) ? 'fill-amber-300 text-amber-300' : 'fill-white/20 text-white/20'}`} />
                                ))}
                            </div>
                            <span className="text-white font-bold">{center.avgRating}</span>
                            <span className="text-pink-200 text-sm">({center.totalReviews} تقييم)</span>
                        </div>
                    )}

                    {/* Quick info pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {center.working_hours && (
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                                <Clock className="w-3 h-3" />
                                {formatArabicTime(center.working_hours)}
                            </span>
                        )}
                        {center.clinic_address && (
                            <button
                                onClick={handleMap}
                                className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold hover:bg-white/30 transition-all"
                            >
                                <MapPin className="w-3 h-3" />
                                <span className="max-w-[140px] truncate">{center.clinic_address}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-5 pt-5">
                {/* ── Action buttons ── */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={handleCall}
                        className="flex flex-col items-center gap-1.5 py-3 bg-green-500 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-green-600 active:scale-95 transition-all shadow-green-200"
                    >
                        <Phone className="w-5 h-5" />
                        اتصل بنا
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="flex flex-col items-center gap-1.5 py-3 bg-[#25D366] text-white rounded-2xl font-bold text-xs shadow-md hover:bg-green-600 active:scale-95 transition-all shadow-green-200"
                    >
                        <MessageCircle className="w-5 h-5" />
                        واتساب
                    </button>
                    <button
                        onClick={handleMap}
                        className="flex flex-col items-center gap-1.5 py-3 bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-md hover:bg-blue-600 active:scale-95 transition-all shadow-blue-200"
                    >
                        <MapPin className="w-5 h-5" />
                        الموقع
                    </button>
                </div>

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

                {/* ── Services ── */}
                <div>
                    <h2 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-500 to-purple-500 block" />
                        خدماتنا المتاحة
                    </h2>

                    {services.length === 0 ? (
                        <Card className="border-pink-100">
                            <CardContent className="py-10 text-center">
                                <Sparkles className="w-12 h-12 mx-auto mb-3 text-pink-300" />
                                <p className="text-slate-500 text-sm">لم تُضف الخدمات بعد</p>
                            </CardContent>
                        </Card>
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

                {/* ── Book Button ── */}
                <div className="sticky bottom-20 pb-2">
                    <Button
                        onClick={() => {
                            if (!selectedService && services.length > 0) {
                                toast({ title: 'اختر الخدمة أولاً', description: 'يرجى اختيار نوع الخدمة قبل الحجز', variant: 'default' });
                                return;
                            }
                            // Navigate to booking — re-use clinic booking with service note
                            navigate(`/clinic/${id}/${encodeURIComponent(displayName.replace(/\s+/g, '-'))}${selectedService ? `?service=${encodeURIComponent(selectedService.name)}` : ''}`);
                        }}
                        className="w-full h-14 text-base font-black rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 text-white shadow-xl shadow-pink-300/40 hover:shadow-pink-400/50 hover:scale-[1.01] active:scale-95 transition-all"
                    >
                        <Sparkles className="w-5 h-5 ml-2" />
                        {selectedService ? `احجز جلسة ${selectedService.name}` : 'احجز موعدك الآن'}
                        <ChevronRight className="w-5 h-5 mr-auto" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
