import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Building2, MapPin, Phone, Clock, Search, Calendar,
    MessageCircle, Star, Share2, Eye, Navigation,
    LocateFixed, X, ChevronDown, Stethoscope,
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/lib/api';
import PatientHero from '@/components/patient/PatientHero';
import { buildClinicShareUrl, generateSlug } from '@/lib/slug';
import ClinicMapModal, { haversineDistance } from '@/components/patient/ClinicMapModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Clinic {
    id: number;
    name?: string;
    clinic_name?: string;
    clinic_specialty?: string;
    clinic_address?: string;
    clinic_phone?: string;
    clinic_logo?: string;
    avatar?: string;
    location_url?: string;
    working_hours?: string;
    lat?: number | null;
    lng?: number | null;
    avgRating?: number;
    totalReviews?: number;
    phone?: string;
    // computed
    distanceKm?: number;
}

type SortMode = 'default' | 'nearest';

// ── Haversine distance is imported from ClinicMapModal ──

export default function PatientClinics() {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [filtered, setFiltered] = useState<Clinic[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSpec, setActiveSpec] = useState<string>('الكل');
    const [sortMode, setSortMode] = useState<SortMode>('default');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [mapClinic, setMapClinic] = useState<Clinic | null>(null);

    // Unique specialties list
    const [specialties, setSpecialties] = useState<string[]>([]);

    useEffect(() => { fetchClinics(); }, []);

    // ── Build filtered list whenever deps change ──
    useEffect(() => {
        let result = [...clinics];

        // Text filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.clinic_name?.toLowerCase().includes(q) ||
                c.name?.toLowerCase().includes(q) ||
                c.clinic_specialty?.toLowerCase().includes(q) ||
                c.clinic_address?.toLowerCase().includes(q)
            );
        }

        // Specialty filter
        if (activeSpec !== 'الكل') {
            result = result.filter(c => c.clinic_specialty === activeSpec);
        }

        // Distance sort
        if (sortMode === 'nearest' && userLocation) {
            result = result
                .map(c => ({
                    ...c,
                    distanceKm: (c.lat != null && c.lng != null)
                        ? haversineDistance(userLocation.lat, userLocation.lng, c.lat, c.lng)
                        : Infinity,
                }))
                .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        }

        setFiltered(result);
    }, [searchTerm, activeSpec, sortMode, clinics, userLocation]);

    const fetchClinics = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/clinics`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true',
                },
            });
            const data: Clinic[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
            setClinics(data);

            // Extract unique specialties
            const specs = Array.from(new Set(data.map(c => c.clinic_specialty).filter(Boolean))) as string[];
            setSpecialties(specs);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء تحميل العيادات' });
        } finally {
            setLoading(false);
        }
    };

    // ── Nearest clinic via Geolocation ──
    const handleNearestClinic = useCallback(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'غير مدعوم', description: 'متصفحك لا يدعم تحديد الموقع' });
            return;
        }
        if (sortMode === 'nearest') {
            setSortMode('default');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setSortMode('nearest');
                setLocating(false);
                toast({ title: '📍 تم تحديد موقعك', description: 'سيتم عرض العيادات مرتبة حسب القرب منك' });
            },
            (err) => {
                setLocating(false);
                const msg = err.code === 1
                    ? 'يرجى السماح للتطبيق بالوصول إلى موقعك'
                    : 'تعذّر تحديد موقعك';
                toast({ variant: 'destructive', title: 'خطأ في الموقع', description: msg });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [sortMode, toast]);

    // ── Share ──
    const handleShare = async (e: React.MouseEvent, clinic: Clinic) => {
        e.stopPropagation();
        const clinicName = clinic.clinic_name || clinic.name || '';
        const shareUrl = buildClinicShareUrl(clinic.id, clinicName);
        const shareText = `🏥 ${clinicName}${clinic.clinic_specialty ? `\n📋 ${clinic.clinic_specialty}` : ''}${clinic.clinic_address ? `\n📍 ${clinic.clinic_address}` : ''}${(clinic.clinic_phone || clinic.phone) ? `\n📞 ${clinic.clinic_phone || clinic.phone}` : ''}\n\n🌟 احجز موعدك عبر Doctor Jo!`;

        if (navigator.share) {
            try { await navigator.share({ title: clinicName, text: shareText, url: shareUrl }); } catch { }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: '✅ تم نسخ الرابط' });
        }
    };

    // ── Open Google Maps (location_url → lat/lng → address text) ──
    const handleMapClick = (e: React.MouseEvent, clinic: Clinic) => {
        e.stopPropagation();
        let url: string | null = null;
        if (clinic.location_url) {
            url = clinic.location_url;
        } else if (clinic.lat != null && clinic.lng != null) {
            url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
        } else if (clinic.clinic_address) {
            url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.clinic_address)}`;
        }
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    const logoSrc = (clinic: Clinic) => {
        const raw = clinic.clinic_logo || clinic.avatar;
        if (!raw) return null;
        return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
    };

    return (
        <div className="space-y-0 animate-fade-in pb-24" dir="rtl">
            {/* Hero */}
            <PatientHero
                showBackButton={true}
                title="العيادات المتاحة"
                subtitle="اكتشف أفضل الأطباء"
                description="اختر العيادة المناسبة واحجز موعدك من المواعيد المتاحة."
                badgeText="صحتك أولاً"
            />

            <div className="px-4 sm:px-0 space-y-4 pt-6">
                {/* ── Search + Nearest button ── */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ابحث عن عيادة، تخصص، أو موقع..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                    <button
                        onClick={handleNearestClinic}
                        disabled={locating}
                        title="أقرب عيادة"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm whitespace-nowrap ${
                            sortMode === 'nearest'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                        <LocateFixed className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
                        {locating ? 'جاري...' : sortMode === 'nearest' ? 'إلغاء القرب' : 'الأقرب إليّ'}
                    </button>
                </div>

                {/* ── Specialty Filter Pills ── */}
                {specialties.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {['الكل', ...specialties].map(spec => (
                            <button
                                key={spec}
                                onClick={() => setActiveSpec(spec)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                    activeSpec === spec
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                )}

                {/* Distance badge when nearest mode */}
                {sortMode === 'nearest' && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-700">
                        <Navigation className="h-4 w-4 flex-shrink-0" />
                        <span>مرتب حسب قربه منك — العيادة الأولى هي الأقرب إليك</span>
                        <button onClick={() => setSortMode('default')} className="mr-auto text-blue-400 hover:text-blue-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* ── Clinics Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <Card className="shadow-sm rounded-2xl">
                        <CardContent className="py-16 text-center">
                            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                            <h3 className="text-lg font-bold mb-2">لا توجد عيادات</h3>
                            <p className="text-muted-foreground text-sm">
                                {searchTerm || activeSpec !== 'الكل' ? 'لم يتم العثور على نتائج' : 'لا توجد عيادات متاحة حالياً'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((clinic) => {
                            const logo = logoSrc(clinic);
                            const displayName = clinic.clinic_name || clinic.name || 'عيادة';
                            const hasMap = !!(clinic.lat || clinic.location_url || clinic.clinic_address);
                            const distStr = sortMode === 'nearest' && clinic.distanceKm != null && clinic.distanceKm !== Infinity
                                ? clinic.distanceKm < 1
                                    ? `${Math.round(clinic.distanceKm * 1000)} م`
                                    : `${clinic.distanceKm.toFixed(1)} كم`
                                : null;

                            return (
                                <Card
                                    key={clinic.id}
                                    className="relative rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
                                    onClick={() => navigate(`/clinic/${clinic.id}/${generateSlug(displayName)}`)}
                                >
                                    {/* Top gradient accent */}
                                    <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

                                    {/* Distance badge top-left */}
                                    {distStr && (
                                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                            <Navigation className="h-2.5 w-2.5" />
                                            {distStr}
                                        </div>
                                    )}

                                    {/* Card header */}
                                    <div className="flex items-start gap-4 p-5 pb-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full blur-[5px] opacity-50 group-hover:opacity-80 transition-opacity" />
                                            <div className="relative h-14 w-14 rounded-full bg-white p-0.5 z-10">
                                                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center overflow-hidden border border-white">
                                                    {logo ? (
                                                        <img src={logo} alt={displayName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="font-black text-xl text-blue-800">{displayName.charAt(0)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <p className="font-extrabold text-base text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                                {displayName}
                                            </p>
                                            {clinic.clinic_specialty && (
                                                <span className="inline-block text-[11px] text-orange-600 font-bold mt-1 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                                    {clinic.clinic_specialty}
                                                </span>
                                            )}
                                            {/* Rating */}
                                            {(clinic.totalReviews ?? 0) > 0 && (
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs font-bold text-yellow-700">{clinic.avgRating}</span>
                                                    <span className="text-[10px] text-slate-400">({clinic.totalReviews})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info rows */}
                                    <div className="px-5 pb-4 space-y-2 flex-1">
                                        {(clinic.clinic_specialty || clinic.clinic_description) && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium bg-purple-50/50 p-1.5 rounded-lg border border-purple-100/50 -mx-1.5 px-2">
                                                <Stethoscope className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                                <span className="truncate" title={clinic.clinic_specialty || clinic.clinic_description}>{clinic.clinic_specialty || clinic.clinic_description}</span>
                                            </div>
                                        )}
                                        {clinic.clinic_address && (
                                            <button
                                                onClick={(e) => handleMapClick(e, clinic)}
                                                className={`w-full flex items-start gap-2 text-sm font-medium text-right transition-colors group/loc ${hasMap ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-slate-500 cursor-default'}`}
                                                title={hasMap ? 'عرض على الخريطة' : ''}
                                            >
                                                <MapPin className={`h-4 w-4 mt-0.5 flex-shrink-0 transition-colors ${hasMap ? 'text-blue-500 group-hover/loc:text-blue-700' : 'text-slate-400'}`} />
                                                <span className="line-clamp-2 text-right">{clinic.clinic_address}</span>
                                                {hasMap && (
                                                    <Navigation className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-60" />
                                                )}
                                            </button>
                                        )}
                                        {(clinic.clinic_phone || clinic.phone) && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                <span dir="ltr">{clinic.clinic_phone || clinic.phone}</span>
                                            </div>
                                        )}
                                        {clinic.working_hours && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                                                <span className="truncate">{clinic.working_hours}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action bar */}
                                    <div className="flex items-center gap-2 p-3 bg-slate-50/80 border-t border-slate-100 mt-auto backdrop-blur-sm">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/clinic/${clinic.id}/${generateSlug(displayName)}`); }}
                                            className="flex-1 flex justify-center items-center gap-2 h-10 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
                                        >
                                            <Calendar className="h-4 w-4 shadow-sm" />
                                            احجز موعد
                                        </button>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {hasMap && (
                                                <button
                                                    onClick={(e) => handleMapClick(e, clinic)}
                                                    className="flex justify-center items-center h-10 w-10 rounded-xl text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all"
                                                    title="الموقع على الخريطة"
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/clinic/${clinic.id}/${generateSlug(displayName)}`); }}
                                                className="flex justify-center items-center h-10 w-10 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={(e) => handleShare(e, clinic)}
                                                className="flex justify-center items-center h-10 w-10 rounded-xl text-purple-600 bg-purple-50 border border-purple-200 hover:bg-purple-100 active:scale-95 transition-all"
                                                title="مشاركة العيادة"
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Map Modal */}
            {mapClinic && (
                <ClinicMapModal
                    clinic={mapClinic}
                    onClose={() => setMapClinic(null)}
                />
            )}
        </div>
    );
}
