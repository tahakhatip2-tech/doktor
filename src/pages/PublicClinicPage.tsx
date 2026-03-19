import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    MapPin, Phone, Clock, Calendar,
    MessageCircle, Star, Share2, AlertCircle, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/lib/api';
import { buildClinicShareUrl } from '@/lib/slug';
import { useToast } from '@/hooks/use-toast';

// Import the full clinic detail component (reuse for logged-in patients)
import PatientClinicDetail from '@/pages/patient/PatientClinicDetail';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PublicClinicPage() {
    const { id } = useParams<{ id: string; slug?: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Check if patient is already logged in
    const patientToken = localStorage.getItem('patient_token');
    const isLoggedIn = Boolean(patientToken);

    // ── If patient is logged in → render the full PatientClinicDetail ──
    // Reuses the existing component with all booking functionality.
    // No extra data fetching, no duplicate UI. Completely DRY.
    if (isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
                <div className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500" />
                <div className="container px-4 sm:px-8 py-4 sm:py-6 mx-auto max-w-7xl pb-10">
                    <button
                        onClick={() => navigate('/patient/clinics')}
                        className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <span className="text-lg">→</span>
                        العودة إلى العيادات
                    </button>
                    <PatientClinicDetail />
                </div>
            </div>
        );
    }

    // ── Public (non-logged-in) view ────────────────────────────────────
    return <PublicClinicView id={id} toast={toast} />;
}

// ── Public view component (unauthenticated) ────────────────────────────
function PublicClinicView({ id, toast }: { id?: string; toast: any }) {
    const [clinic, setClinic] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchClinic = async () => {
            try {
                const response = await axios.get(`${API_URL}/public/clinics/${id}`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'bypass-tunnel-reminder': 'true',
                    },
                });
                setClinic(response.data);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchClinic();
    }, [id]);

    const handleShare = async () => {
        if (!clinic) return;
        const shareUrl = buildClinicShareUrl(clinic.id, clinic.clinic_name || clinic.name);
        const text = `🏥 ${clinic.clinic_name || clinic.name}${clinic.clinic_specialty ? `\n📋 ${clinic.clinic_specialty}` : ''}${clinic.clinic_address ? `\n📍 ${clinic.clinic_address}` : ''}${clinic.clinic_phone ? `\n📞 ${clinic.clinic_phone}` : ''}`;
        if (navigator.share) {
            try { await navigator.share({ title: clinic.clinic_name || clinic.name, text, url: shareUrl }); } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: '✅ تم نسخ الرابط', description: 'يمكنك الآن مشاركته مع من تريد' });
        }
    };

    const logoUrl = clinic?.clinic_logo
        ? (clinic.clinic_logo.startsWith('http') ? clinic.clinic_logo : `${BASE_URL}${clinic.clinic_logo.startsWith('/') ? '' : '/'}${clinic.clinic_logo}`)
        : null;
    const avatarUrl = clinic?.avatar
        ? (clinic.avatar.startsWith('http') ? clinic.avatar : `${BASE_URL}${clinic.avatar.startsWith('/') ? '' : '/'}${clinic.avatar}`)
        : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col" dir="rtl">
                <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500" />
                <div className="max-w-2xl mx-auto w-full px-4 py-10 space-y-5">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !clinic) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4" dir="rtl">
                <div className="max-w-sm w-full text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">العيادة غير موجودة</h2>
                    <p className="text-slate-500 text-sm">لم يتم العثور على بيانات هذه العيادة.</p>
                    <Link to="/unified-auth">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl px-8 mt-2 font-bold">
                            الذهاب للتطبيق
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col" dir="rtl">
            <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500" />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/hakeem-logo.png" alt="Doctor Jo" className="h-8 w-8 object-contain rounded-lg"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
                        <div className="leading-none">
                            <p className="text-sm font-black bg-gradient-to-r from-blue-700 to-orange-500 bg-clip-text text-transparent">DOCTOR JO</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Clinic Portal</p>
                        </div>
                    </div>
                    <Link to="/unified-auth">
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold text-xs px-4">
                            سجّل دخول / إنشاء حساب
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">

                {/* Clinic info card */}
                <div className="relative rounded-2xl bg-white shadow-[0_4px_30px_rgba(37,99,235,0.08)] border border-blue-50 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-400" />
                    <div className="p-5 flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full blur opacity-40" />
                            <div className="relative h-20 w-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-xl">
                                {(logoUrl || avatarUrl) ? (
                                    <img src={logoUrl || avatarUrl!} alt={clinic.clinic_name || clinic.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="font-black text-3xl text-blue-700">
                                        {(clinic.clinic_name || clinic.name || 'ع').charAt(0)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-black text-slate-900 leading-tight">{clinic.clinic_name || clinic.name}</h1>
                            {clinic.clinic_specialty && (
                                <span className="inline-block mt-1.5 px-3 py-0.5 text-xs font-bold rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                                    {clinic.clinic_specialty}
                                </span>
                            )}
                            {clinic.clinic_description && (
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{clinic.clinic_description}</p>
                            )}
                        </div>
                    </div>

                    <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {clinic.clinic_address && (
                            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">العنوان</p>
                                    {clinic.location_url ? (
                                        <a href={clinic.location_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline">{clinic.clinic_address}</a>
                                    ) : (
                                        <p className="text-sm font-bold text-slate-700">{clinic.clinic_address}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {(clinic.clinic_phone || clinic.phone) && (
                            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Phone className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">الهاتف</p>
                                    <a href={`tel:${clinic.clinic_phone || clinic.phone}`} className="text-sm font-bold text-slate-700" dir="ltr">
                                        {clinic.clinic_phone || clinic.phone}
                                    </a>
                                </div>
                            </div>
                        )}
                        {clinic.working_hours && (
                            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <Clock className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ساعات العمل</p>
                                    <p className="text-sm font-bold text-slate-700">{clinic.working_hours}</p>
                                </div>
                            </div>
                        )}
                        {clinic.avgRating > 0 && (
                            <div className="flex items-start gap-2.5 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">التقييم</p>
                                    <p className="text-sm font-black text-slate-700">
                                        {clinic.avgRating}
                                        <span className="font-medium text-slate-400 text-xs mr-1">({clinic.totalReviews} تقييم)</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA — Login to book */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-[0_8px_30px_rgba(37,99,235,0.3)]">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl"><Calendar className="h-5 w-5" /></div>
                        <div>
                            <h2 className="font-black text-lg leading-tight">احجز موعدك الآن</h2>
                            <p className="text-blue-100 text-sm mt-0.5">سجّل دخولك أو أنشئ حساباً مجانياً لحجز موعد في هذه العيادة</p>
                        </div>
                    </div>
                    <Link to={`/unified-auth?redirect=/clinic/${id}`}>
                        <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-black py-5 text-base shadow-lg">
                            <CheckCircle2 className="h-5 w-5 ml-2" />
                            سجّل دخولك وأحجز الآن
                        </Button>
                    </Link>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-3">
                    {(clinic.clinic_phone || clinic.phone) && (
                        <a href={`https://wa.me/${(clinic.clinic_phone || clinic.phone).replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors font-bold text-xs">
                            <MessageCircle className="h-5 w-5" />
                            واتساب
                        </a>
                    )}
                    {clinic.location_url && (
                        <a href={clinic.location_url} target="_blank" rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors font-bold text-xs">
                            <MapPin className="h-5 w-5" />
                            الخريطة
                        </a>
                    )}
                    <button onClick={handleShare}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition-colors font-bold text-xs">
                        <Share2 className="h-5 w-5" />
                        مشاركة
                    </button>
                </div>

                <div className="text-center pt-2 pb-6">
                    <p className="text-xs text-slate-400">مدعوم من منصة <span className="font-black text-blue-600">Doctor Jo</span> لإدارة العيادات</p>
                </div>
            </main>
        </div>
    );
}
