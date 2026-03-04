import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Clock, Search, Calendar, MessageCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

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
                headers: { Authorization: `Bearer ${token}` },
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

    const handleWhatsApp = (e: React.MouseEvent, clinic: any) => {
        e.stopPropagation();
        const phone = clinic.clinic_phone || clinic.phone;
        if (phone) {
            const formattedPhone = phone.replace(/\D/g, '');
            window.open(`https://wa.me/${formattedPhone}`, '_blank');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold mb-2">العيادات المتاحة</h1>
                <p className="text-muted-foreground">اختر العيادة المناسبة واحجز موعدك من المواعيد المتاحة</p>
            </div>

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
                            className="shadow-card hover:shadow-glow transition-all group cursor-pointer hover:-translate-y-1"
                            onClick={() => navigate(`/patient/clinics/${clinic.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Building2 className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <CardTitle className="text-lg truncate">
                                                {clinic.clinic_name || clinic.name}
                                            </CardTitle>
                                            {clinic.clinic_specialty && (
                                                <Badge variant="secondary" className="mt-1 text-xs">
                                                    {clinic.clinic_specialty}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {clinic.clinic_address && (
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">{clinic.clinic_address}</span>
                                    </div>
                                )}
                                {(clinic.clinic_phone || clinic.phone) && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span dir="ltr">{clinic.clinic_phone || clinic.phone}</span>
                                    </div>
                                )}
                                {clinic.working_hours && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{clinic.working_hours}</span>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        className="flex-1 gradient-primary text-white shadow-glow gap-2 group-hover:scale-[1.02] transition-transform"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/patient/clinics/${clinic.id}`); }}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        احجز موعد
                                        <ArrowLeft className="h-3 w-3 mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => handleWhatsApp(e, clinic)}
                                        className="hover:bg-green-500 hover:text-white transition-colors hover:border-green-500"
                                        title="تواصل عبر واتساب"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
