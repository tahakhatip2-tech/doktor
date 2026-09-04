import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    MapPin, Search, Eye, Share2, LocateFixed, HeartPulse, Stethoscope, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/lib/api';
import PatientHero from '@/components/patient/PatientHero';
import { buildClinicShareUrl } from '@/lib/slug';
import { haversineDistance } from '@/components/patient/ClinicMapModal';

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
    distanceKm?: number;
}

export default function PatientHomeCareList() {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState<Clinic[]>([]);
    const [filtered, setFiltered] = useState<Clinic[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortMode, setSortMode] = useState<'default' | 'nearest'>('default');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);

    useEffect(() => { 
        fetchProviders(); 
    }, []);

    useEffect(() => {
        let result = [...providers];

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.clinic_name?.toLowerCase().includes(q) ||
                c.name?.toLowerCase().includes(q) ||
                c.clinic_address?.toLowerCase().includes(q)
            );
        }

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
    }, [searchTerm, sortMode, providers, userLocation]);

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            // Assuming we have an endpoint for home-care providers, but wait!
            // Let's check how PatientClinics fetches beauty centers: /patient/beauty-centers
            // I should fetch /patient/home-care-providers
            const res = await axios.get(`${API_URL}/patient/home-care-providers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data: Clinic[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
            setProviders(data);
        } catch {
            // Silently handle error or show toast
        } finally {
            setLoading(false);
        }
    };

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
                toast({ title: '📍 تم تحديد موقعك', description: 'سيتم عرض المراكز مرتبة حسب القرب منك' });
            },
            (err) => {
                setLocating(false);
                toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحديد موقعك' });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [sortMode, toast]);

    const handleShare = async (e: React.MouseEvent, clinic: Clinic) => {
        e.stopPropagation();
        const clinicName = clinic.clinic_name || clinic.name || '';
        const shareUrl = buildClinicShareUrl(clinic.id, clinicName);
        const shareText = `🏥 ${clinicName}\n📍 ${clinic.clinic_address || ''}\n🌟 احجز خدمة الرعاية المنزلية عبر Doctor Jo!`;

        if (navigator.share) {
            try { await navigator.share({ title: clinicName, text: shareText, url: shareUrl }); } catch { }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast({ title: '✅ تم نسخ الرابط' });
        }
    };

    const logoSrc = (clinic: Clinic) => {
        const raw = clinic.clinic_logo || clinic.avatar;
        if (!raw) return null;
        return raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
    };

    return (
        <div className="space-y-0 animate-fade-in pb-24" dir="rtl">
            <PatientHero
                showBackButton={true}
                title="الرعاية والتمريض المنزلي"
                subtitle="صحتك في بيتك"
                description="نقدم لك أفضل خدمات الرعاية الطبية والتمريض المنزلي براحة وأمان في منزلك."
                badgeText="رعاية منزلية"
            />

            <div className="px-4 sm:px-0 space-y-4 pt-6">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ابحث عن مزود رعاية منزلية..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                    <button
                        onClick={handleNearestClinic}
                        disabled={locating}
                        title="أقرب مزود رعاية"
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm whitespace-nowrap ${
                            sortMode === 'nearest'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200'
                                : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50'
                        }`}
                    >
                        <LocateFixed className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
                        {locating ? 'جاري...' : sortMode === 'nearest' ? 'إلغاء القرب' : 'الأقرب إليّ'}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-purple-200">
                            <HeartPulse className="h-16 w-16 text-purple-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">لا يوجد مزودي رعاية</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">لم نتمكن من العثور على مزودي رعاية منزلية مطابقين لبحثك حالياً.</p>
                        </div>
                    ) : (
                        filtered.map(clinic => {
                            const logo = logoSrc(clinic);
                            const name = clinic.clinic_name || clinic.name || 'مزود رعاية';
                            const distanceStr = clinic.distanceKm != null ? `${clinic.distanceKm.toFixed(1)} كم` : null;

                            return (
                                <Card 
                                    key={clinic.id} 
                                    className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-purple-100 group relative"
                                    onClick={() => navigate(`/patient/home-care/${clinic.id}`)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/10"></div>
                                    
                                    <CardContent className="p-5 relative z-10">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group-hover:border-purple-200 transition-colors">
                                                {logo ? (
                                                    <img src={logo} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                ) : (
                                                    <HeartPulse className="w-8 h-8 text-purple-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-slate-800 truncate mb-1 group-hover:text-purple-700 transition-colors">{name}</h3>
                                                {clinic.clinic_specialty && (
                                                    <p className="text-sm font-medium text-purple-600 mb-2 truncate bg-purple-50 inline-block px-2 py-0.5 rounded-full">
                                                        {clinic.clinic_specialty}
                                                    </p>
                                                )}
                                                {clinic.clinic_address && (
                                                    <div className="flex items-center text-xs text-slate-500 mb-1">
                                                        <MapPin className="w-3 h-3 ml-1 text-slate-400 shrink-0" />
                                                        <span className="truncate">{clinic.clinic_address}</span>
                                                    </div>
                                                )}
                                                {distanceStr && (
                                                    <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-max mt-2">
                                                        <LocateFixed className="w-3 h-3 ml-1" />
                                                        يبعد {distanceStr}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                                            <button 
                                                className="flex-1 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white transition-colors h-10 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                عرض الخدمات
                                            </button>
                                            <button 
                                                onClick={(e) => handleShare(e, clinic)}
                                                className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
                                                title="مشاركة"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
