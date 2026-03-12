import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Clock, Search, Calendar, MessageCircle, Star, Share2, Eye, Facebook, Instagram, Twitter } from 'lucide-react';
import axios from 'axios';

import { BASE_URL } from '@/lib/api';
import PatientHero from '@/components/patient/PatientHero';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientClinics() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState<any[]>([]);
    const [filteredClinics, setFilteredClinics] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchClinics(); }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = clinics.filter((clinic) =>
                clinic.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clinic.clinic_specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clinic.clinic_address?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClinics(filtered);
        } else {
            setFilteredClinics(clinics);
        }
    }, [searchTerm, clinics]);

    const fetchClinics = async () => {
        try {
            const token = localStorage.getItem('patient_token');
            const response = await axios.get(`${API_URL}/patient/clinics`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true',
                },
            });
            const fetchedClinics = Array.isArray(response.data)
                ? response.data
                : (response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
            setClinics(fetchedClinics);
            setFilteredClinics(fetchedClinics);
        } catch {
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء تحميل العيادات' });
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (e: React.MouseEvent, clinic: any) => {
        e.stopPropagation();
        
        const clinicName = clinic.clinic_name || clinic.name;
        const clinicPhone = clinic.clinic_phone || clinic.phone;
        const shareText = `هل تبحث عن عيادة متخصصة؟ 🏥\nأنصحك بعيادة الدكتورة/الدكتور ${clinicName} عبر منصة Doctor Jo المميزة.\n\n📍 العنوان: ${clinic.clinic_address || 'متوفر على التطبيق'}\n📞 للتواصل والحجز: ${clinicPhone || 'حمل التطبيق'}\n\n🌟 احجز الآن بسهولة عبر بوابة Doctor Jo!`;
        const shareUrl = window.location.origin + `/patient/clinics/${clinic.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `عيادة ${clinicName}`,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for desktop/unsupported browsers (Copy to clipboard)
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast({
                title: 'تم النسخ',
                description: 'تم نسخ معلومات العيادة للمشاركة.',
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <PatientHero
                showBackButton={true}
                title="العيادات المتاحة"
                subtitle="اكتشف أفضل الأطباء"
                description="اختر العيادة المناسبة واحجز موعدك من المواعيد المتاحة."
                badgeText="صحتك أولاً"
            />

            <div className="px-4 sm:px-0 space-y-6">
                <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن عيادة، تخصص، أو موقع..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
                    </div>
                ) : filteredClinics.length === 0 ? (
                    <Card className="shadow-card">
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد عيادات</h3>
                            <p className="text-muted-foreground">
                                {searchTerm ? 'لم يتم العثور على نتائج للبحث' : 'لا توجد عيادات متاحة حالياً'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClinics.map((clinic) => (
                            <Card
                                key={clinic.id}
                                className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full"
                                onClick={() => navigate(`/patient/clinics/${clinic.id}`)}
                            >
                                <div className="flex-1">
                                    {/* ── Header (Avatar, Doctor, Clinic) ───────────────── */}
                                    <div className="flex items-start justify-between p-5 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full blur-[4px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative h-14 w-14 rounded-full bg-white p-0.5 z-10">
                                                    <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-100 to-orange-50 flex items-center justify-center overflow-hidden border border-white">
                                                        {(clinic.clinic_logo || clinic.avatar) ? (
                                                            <img
                                                                src={(clinic.clinic_logo || clinic.avatar).startsWith('http') ? (clinic.clinic_logo || clinic.avatar) : `${BASE_URL}${(clinic.clinic_logo || clinic.avatar).startsWith('/') ? '' : '/'}${clinic.clinic_logo || clinic.avatar}`}
                                                                alt={clinic.clinic_name || clinic.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="font-black text-xl text-blue-800">
                                                                {(clinic.clinic_name || clinic.name || 'ع').charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="font-extrabold text-base text-slate-900 truncate">
                                                    {clinic.clinic_name || clinic.name}
                                                </p>
                                                
                                                {clinic.clinic_specialty && (
                                                    <p className="text-xs text-orange-600 font-bold mt-1 bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100 truncate">
                                                        {clinic.clinic_specialty}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Content (Specialty, Address, Contact) ───────────── */}
                                    <div className="px-5 pb-5 space-y-3">
                                        {clinic.clinic_specialty && (
                                            <div className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 mb-3 shadow-sm inline-block w-full text-center">
                                                {clinic.clinic_specialty}
                                            </div>
                                        )}
                                        
                                        {clinic.clinic_address && (
                                            <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                                {clinic.location_url ? (
                                                    <a
                                                        href={clinic.location_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="line-clamp-1 hover:text-blue-700 hover:underline cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {clinic.clinic_address}
                                                    </a>
                                                ) : (
                                                    <span className="line-clamp-1">{clinic.clinic_address}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            {(clinic.clinic_phone || clinic.phone) && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium min-w-0">
                                                    <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                    <span dir="ltr" className="truncate">{clinic.clinic_phone || clinic.phone}</span>
                                                </div>
                                            )}
                                            {/* التقييم */}
                                            {(clinic.totalReviews > 0) && (
                                                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-yellow-200 shadow-sm mr-auto">
                                                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                                    <span>{clinic.avgRating}</span>
                                                    <span className="text-yellow-600/80 mr-0.5">({clinic.totalReviews})</span>
                                                </div>
                                            )}
                                        </div>
                                        {clinic.working_hours && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                                                <span className="truncate">{clinic.working_hours}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── Bottom Action Bar ───────────────────────────────── */}
                                <div className="flex items-center gap-1.5 px-3 py-3 bg-slate-50 border-t border-slate-200 mt-auto">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/patient/clinics/${clinic.id}`); }}
                                        className="flex-[2] flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                        احجز موعد
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/patient/clinics/${clinic.id}`); }}
                                        className="flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-sm"
                                        title="التفاصيل"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        تفاصيل
                                    </button>

                                    <button
                                        onClick={(e) => handleShare(e, clinic)}
                                        className="flex-[0.5] flex justify-center items-center gap-1.5 py-1.5 rounded text-xs font-bold transition-all duration-300 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 shadow-sm"
                                        title="مشاركة"
                                    >
                                        <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

