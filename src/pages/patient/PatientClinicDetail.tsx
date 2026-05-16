import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin, Phone, Clock, Calendar, MessageCircle, ArrowRight, ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle, Plus, Search, User, Star } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { format, startOfDay, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BASE_URL } from '@/lib/api';
import PatientHero from '@/components/patient/PatientHero';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬ ط§ظ„ط£ظٹط§ظ… ط¨ط§ظ„ظ„ط؛ط© ط§ظ„ط¹ط±ط¨ظٹط© أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
const DAY_NAMES_AR = ['ط£ط­ط¯', 'ط§ط«ظ†ظٹظ†', 'ط«ظ„ط§ط«ط§ط،', 'ط£ط±ط¨ط¹ط§ط،', 'ط®ظ…ظٹط³', 'ط¬ظ…ط¹ط©', 'ط³ط¨طھ'];

export default function PatientClinicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [clinic, setClinic] = useState<any>(null);
    const [loadingClinic, setLoadingClinic] = useState(true);

    // أ¢â€‌â‚¬أ¢â€‌â‚¬ ط§ظ„طھظ‚ظˆظٹظ… أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // أ¢â€‌â‚¬أ¢â€‌â‚¬ ط§ظ„ظ€ Slots أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // أ¢â€‌â‚¬أ¢â€‌â‚¬ Booking Dialog أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    const [bookingOpen, setBookingOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    // â”€â”€ ط§ظ„طھظ‚ظٹظٹظ…ط§طھ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [reviewsData, setReviewsData] = useState<any>(null);
    const [myReview, setMyReview] = useState<any>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);


    // أ¢â€‌â‚¬أ¢â€‌â‚¬ ط¬ظ„ط¨ ط¨ظٹط§ظ†ط§طھ ط§ظ„ط¹ظٹط§ط¯ط© أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    useEffect(() => {
        const fetchClinic = async () => {
            try {
                const token = localStorage.getItem('patient_token');
                const response = await axios.get(`${API_URL}/patient/clinics/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setClinic(response.data);
            } catch {
                toast({ variant: 'destructive', title: 'ط®ط·ط£', description: 'ظ„ظ… ظٹطھظ… ط§ظ„ط¹ط«ظˆط± ط¹ظ„ظ‰ ط§ظ„ط¹ظٹط§ط¯ط©' });
                navigate('/patient/clinics');
            } finally {
                setLoadingClinic(false);
            }
        };
        if (id) fetchClinic();
    }, [id]);

    // أ¢â€‌â‚¬أ¢â€‌â‚¬ ط¬ظ„ط¨ ط§ظ„ظ€ Slots ط¹ظ†ط¯ ط§ط®طھظٹط§ط± ظٹظˆظ… أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    const fetchSlots = useCallback(async (date: Date) => {
        if (!id) return;
        setLoadingSlots(true);
        setSlots([]);
        setSelectedSlot(null);
        try {
            const token = localStorage.getItem('patient_token');
            const dateStr = format(date, 'yyyy-MM-dd');
            const response = await axios.get(
                `${API_URL}/patient/clinics/${id}/available-slots?date=${dateStr}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSlots(response.data.slots || []);
        } catch {
            toast({ variant: 'destructive', title: 'ط®ط·ط£', description: 'طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„ظ…ظˆط§ط¹ظٹط¯ ط§ظ„ظ…طھط§ط­ط©' });
        } finally {
            setLoadingSlots(false);
        }
    }, [id]);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        fetchSlots(date);
    };

    // أ¢â€‌â‚¬أ¢â€‌â‚¬ ط¥ط±ط³ط§ظ„ ط§ظ„ط­ط¬ط² أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedSlot || !clinic) return;

        setBookingLoading(true);
        try {
            const token = localStorage.getItem('patient_token');

            // ط¨ظ†ط§ط، ط§ظ„طھط§ط±ظٹط® ظˆط§ظ„ظˆظ‚طھ ط§ظ„ظƒط§ظ…ظ„
            const [time, period] = selectedSlot.split(' ');
            const [hoursRaw, minutes] = time.split(':').map(Number);
            let hours = hoursRaw;
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const appointmentDate = new Date(selectedDate);
            appointmentDate.setHours(hours, minutes, 0, 0);

            await axios.post(
                `${API_URL}/patient/appointments`,
                {
                    clinicId: clinic.id,
                    appointmentDate: appointmentDate.toISOString(),
                    notes,
                    duration: 30,
                    ...(customerName.trim() ? { customerName: customerName.trim() } : {}),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: 'أ¢إ“â€¦ طھظ… ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ط§ظ„ط­ط¬ط²!',
                description: `ظ…ظˆط¹ط¯ظƒ ظٹظˆظ… ${format(selectedDate, 'EEEE dd MMMM', { locale: ar })} ط§ظ„ط³ط§ط¹ط© ${selectedSlot} أ¢â‚¬â€‌ ظپظٹ ط§ظ†طھط¸ط§ط± طھط£ظƒظٹط¯ ط§ظ„ط·ط¨ظٹط¨`,
            });

            setBookingOpen(false);
            setSelectedSlot(null);
            setNotes('');
            
            // Redirect to appointments page after a short delay
            setTimeout(() => {
                navigate('/patient/appointments');
            }, 1000);
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'ط®ط·ط£ ظپظٹ ط§ظ„ط­ط¬ط²',
                description: err.response?.data?.message || 'ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط¥ط±ط³ط§ظ„ ط§ظ„ط·ظ„ط¨',
            });
        } finally {
            setBookingLoading(false);
        }
    };

    // â”€â”€ ط¬ظ„ط¨ ط§ظ„طھظ‚ظٹظٹظ…ط§طھ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchReviews = useCallback(async () => {
        if (!id) return;
        try {
            const [reviewsRes, myReviewRes] = await Promise.all([
                axios.get(`${API_URL}/patient/clinics/${id}/reviews`),
                axios.get(`${API_URL}/patient/clinics/${id}/my-review`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('patient_token')}` },
                }).catch(() => ({ data: null })),
            ]);
            setReviewsData(reviewsRes.data);
            setMyReview(myReviewRes.data);
        } catch { /* ignore */ }
    }, [id]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // â”€â”€ ط¥ط±ط³ط§ظ„ طھظ‚ظٹظٹظ… â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSubmitReview = async () => {
        if (!id) return;
        setReviewLoading(true);
        try {
            await axios.post(
                `${API_URL}/patient/clinics/${id}/reviews`,
                { rating: reviewRating, comment: reviewComment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('patient_token')}` } }
            );
            toast({ title: 'âœ… ط´ظƒط±ط§ظ‹ ط¹ظ„ظ‰ طھظ‚ظٹظٹظ…ظƒ!', description: 'طھظ… ط­ظپط¸ طھظ‚ظٹظٹظ…ظƒ ط¨ظ†ط¬ط§ط­' });
            setReviewOpen(false);
            fetchReviews();
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'ظ„ظ… ظٹطھظ… ط§ظ„ط¥ط±ط³ط§ظ„',
                description: err.response?.data?.message || 'ظٹظ…ظƒظ†ظƒ ط§ظ„طھظ‚ظٹظٹظ… ظپظ‚ط· ط¨ط¹ط¯ ط¥طھظ…ط§ظ… ط²ظٹط§ط±ط©',
            });
        } finally {
            setReviewLoading(false);
        }
    };



    // أ¢â€‌â‚¬أ¢â€‌â‚¬ ط¨ظ†ط§ط، ط£ظٹط§ظ… ط§ظ„طھظ‚ظˆظٹظ… أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    const calendarDays = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });
        const startWeekday = getDay(start); // 0=Sunday
        const fillersBefore = Array(startWeekday).fill(null);
        return [...fillersBefore, ...days];
    };

    const today = startOfDay(new Date());

    // أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬أ¢â€‌â‚¬
    if (loadingClinic) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!clinic) return null;

    return (
        <div className="space-y-0 animate-fade-in w-full pb-20">

            {/* â”€â”€ Hero Section â”€â”€ */}
            <PatientHero
                title={clinic.clinic_name || clinic.name}
                subtitle={`ط§ظ„ط¯ظƒطھظˆط±: ${clinic.name}`}
                badgeText={clinic.clinic_specialty || 'ط§ظ„ط¹ظٹط§ط¯ط©'}
                imageSrc="/doktor-jo-auth-v2.png"
                showBackButton={true}
            />

{/* ── Action Bar ── */}
            <div className="px-4 -mt-6 relative z-30 max-w-5xl mx-auto">
                <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border p-3 flex flex-col gap-3">
                    {/* Row 1: Clinic Logo + Name + Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-orange-100 bg-gradient-to-br from-blue-50 to-blue-100 shrink-0 flex items-center justify-center shadow-sm">
                            {(clinic.clinic_logo || clinic.avatar) ? (
                                <img
                                    src={(clinic.clinic_logo || clinic.avatar)?.startsWith('http')
                                        ? (clinic.clinic_logo || clinic.avatar)
                                        : `${BASE_URL}${(clinic.clinic_logo || clinic.avatar)?.startsWith('/') ? '' : '/'}${clinic.clinic_logo || clinic.avatar}`}
                                    alt={clinic.clinic_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xl font-black text-blue-700">
                                    {(clinic.clinic_name || clinic.name || '?').charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <p className="font-black text-sm text-foreground truncate">{clinic.clinic_name || clinic.name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                                {clinic.clinic_address && (
                                    <span className="flex items-center gap-1 truncate max-w-[130px]">
                                        <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                                        {clinic.clinic_address}
                                    </span>
                                )}
                                {clinic.working_hours && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-orange-400 shrink-0" />
                                        {clinic.working_hours}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Row 2: Action Buttons */}
                    <div className="flex items-center gap-2 w-full">
                        {clinic.location_url && (
                            <Button size="sm" variant="outline"
                                className="flex-1 gap-1.5 rounded-xl h-9 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                onClick={() => window.open(clinic.location_url, '_blank')}>
                                <MapPin className="h-3.5 w-3.5 shrink-0" />الموقع
                            </Button>
                        )}
                        <Button size="sm"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs bg-green-500 hover:bg-green-600 text-white border-0"
                            onClick={() => { const p = clinic.clinic_phone || clinic.phone; if (p) window.open(`tel:${p}`, '_self'); }}>
                            <Phone className="h-3.5 w-3.5 shrink-0" />اتصال
                        </Button>
                        <Button size="sm"
                            className="flex-1 gap-1.5 rounded-xl h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0"
                            onClick={() => navigate(`/patient/chat/${clinic.id}`)}>
                            <MessageCircle className="h-3.5 w-3.5 shrink-0" />مراسلة
                        </Button>
                    </div>
                </div>
            </div>

            {/* â”€â”€ Container for the rest â”€â”€ */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6 mt-4">

            {/* â”€â”€ ظ‚ط³ظ… ط§ظ„ط­ط¬ط² â”€â”€ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                {/* ط§ظ„طھظ‚ظˆظٹظ… */}
                <Card className="shadow-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                ط§ط®طھط± ط§ظ„ظٹظˆظ…
                            </CardTitle>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[100px] text-center">
                                    {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* ط±ط¤ظˆط³ ط§ظ„ط£ظٹط§ظ… */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAY_NAMES_AR.map(d => (
                                <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">
                                    {d}
                                </div>
                            ))}
                        </div>
                        {/* ط£ظٹط§ظ… ط§ظ„ط´ظ‡ط± */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays().map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} />;
                                const isPast = day < today;
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, today);
                                return (
                                    <button
                                        key={day.toISOString()}
                                        disabled={isPast}
                                        onClick={() => handleSelectDate(day)}
                                        className={cn(
                                            'h-9 w-full rounded-lg text-sm font-medium transition-all',
                                            isPast && 'opacity-30 cursor-not-allowed',
                                            !isPast && !isSelected && 'hover:bg-primary/10',
                                            isToday && !isSelected && 'border border-primary text-primary',
                                            isSelected && 'gradient-primary text-white shadow-glow scale-105',
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* ط§ظ„ظ€ Slots */}
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            ط§ظ„ظ…ظˆط§ط¹ظٹط¯ ط§ظ„ظ…طھط§ط­ط©
                            {selectedDate && (
                                <span className="text-sm font-normal text-muted-foreground mr-auto">
                                    {format(selectedDate, 'EEEE dd MMM', { locale: ar })}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedDate ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="text-muted-foreground">ط§ط®طھط± ظٹظˆظ…ط§ظ‹ ظ…ظ† ط§ظ„طھظ‚ظˆظٹظ… ظ„ط¹ط±ط¶ ط§ظ„ظ…ظˆط§ط¹ظٹط¯ ط§ظ„ظ…طھط§ط­ط©</p>
                            </div>
                        ) : loadingSlots ? (
                            <div className="grid grid-cols-3 gap-2">
                                {Array(6).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-10 rounded-lg" />
                                ))}
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                                <p className="text-muted-foreground font-medium">ظ„ط§ طھظˆط¬ط¯ ظ…ظˆط§ط¹ظٹط¯ ظ…طھط§ط­ط©</p>
                                <p className="text-muted-foreground text-sm mt-1">ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ظٹظˆظ… ط¢ط®ط±</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    {slots.map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot === selectedSlot ? null : slot)}
                                            className={cn(
                                                'h-10 rounded-lg text-sm font-medium border transition-all',
                                                selectedSlot === slot
                                                    ? 'gradient-primary text-white border-transparent shadow-glow scale-105'
                                                    : 'border-border hover:border-primary hover:text-primary bg-background'
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>

                                {/* ط²ط± طھط£ظƒظٹط¯ ط§ظ„ط­ط¬ط² */}
                                <Button
                                    className="w-full gradient-primary text-white shadow-glow gap-2"
                                    disabled={!selectedSlot}
                                    onClick={() => setBookingOpen(true)}
                                >
                                    <Calendar className="h-4 w-4" />
                                    {selectedSlot
                                        ? `ط§ط­ط¬ط² ط§ظ„ط³ط§ط¹ط© ${selectedSlot}`
                                        : 'ط§ط®طھط± ظ…ظˆط¹ط¯ط§ظ‹ ظ„ظ„ظ…طھط§ط¨ط¹ط©'
                                    }
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* أ¢â€‌â‚¬أ¢â€‌â‚¬ Dialog طھط£ظƒظٹط¯ ط§ظ„ط­ط¬ط² أ¢â€‌â‚¬أ¢â€‌â‚¬ */}
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            طھط£ظƒظٹط¯ ط§ظ„ط­ط¬ط²
                        </DialogTitle>
                        <DialogDescription>
                            ط±ط§ط¬ط¹ طھظپط§طµظٹظ„ ظ…ظˆط¹ط¯ظƒ ظ‚ط¨ظ„ ط§ظ„طھط£ظƒظٹط¯
                        </DialogDescription>
                    </DialogHeader>

                    {/* ظ…ظ„ط®طµ ط§ظ„ظ…ظˆط¹ط¯ */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3 border">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">ط§ظ„ط¹ظٹط§ط¯ط©</p>
                                <p className="font-semibold">{clinic.clinic_name || clinic.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">ط§ظ„طھط§ط±ظٹط®</p>
                                <p className="font-semibold">
                                    {selectedDate && format(selectedDate, 'EEEEط·إ’ dd MMMM yyyy', { locale: ar })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground">ط§ظ„ظˆظ‚طھ</p>
                                <p className="font-semibold">{selectedSlot}</p>
                            </div>
                        </div>
                    </div>

                    {/* ظ…ظ„ط§ط­ط¸ط§طھ */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">ظ…ظ„ط§ط­ط¸ط§طھ ظ„ظ„ط·ط¨ظٹط¨ (ط§ط®طھظٹط§ط±ظٹ)</Label>
                        <Textarea
                            id="notes"
                            placeholder="ط£ط¶ظپ ط£ظٹ طھظپط§طµظٹظ„ طھط³ط§ط¹ط¯ ط§ظ„ط·ط¨ظٹط¨ ظپظٹ ط§ظ„ط§ط³طھط¹ط¯ط§ط¯ ظ„ط²ظٹط§ط±طھظƒ..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* ط­ط¬ط² ظ„ط´ط®طµ ط¢ط®ط± (ط¬ط¯ظٹط¯) */}
                    <div className="space-y-2">
                        <Label htmlFor="customerName">ط§ط³ظ… ط§ظ„ظ…ط±ظٹط¶ (ط¥ط°ط§ ظƒظ†طھ طھط­ط¬ط² ظ„ط´ط®طµ ط¢ط®ط±)</Label>
                        <Input
                            id="customerName"
                            placeholder="ط§ط®طھظٹط§ط±ظٹ - ط§طھط±ظƒ ط§ظ„ط­ظ‚ظ„ ظپط§ط±ط؛ط§ظ‹ ط¥ط°ط§ ظƒط§ظ† ط§ظ„ط­ط¬ط² ظ„ظƒ"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        ط³ظٹطھظ… ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ ط§ظ„ظ…ظˆط¹ط¯ ط¥ظ„ظ‰ ط§ظ„ط·ط¨ظٹط¨ ظˆط³طھط´ط¹ط± ط¹ظ†ط¯ ط§ظ„طھط£ظƒظٹط¯.
                    </p>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBookingOpen(false)}
                            disabled={bookingLoading}
                            className="flex-1"
                        >
                            ط¥ظ„ط؛ط§ط،
                        </Button>
                        <Button
                            className="flex-1 gradient-primary text-white"
                            onClick={handleConfirmBooking}
                            disabled={bookingLoading}
                        >
                            {bookingLoading ? (
                                <><Loader2 className="h-4 w-4 ml-2 animate-spin" />ط¬ط§ط±ظٹ ط§ظ„ط­ط¬ط²...</>
                            ) : (
                                'طھط£ظƒظٹط¯ ط§ظ„ط­ط¬ط²'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* â”€â”€ ظ‚ط³ظ… ط§ظ„طھظ‚ظٹظٹظ…ط§طھ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <Card className="shadow-card overflow-hidden">
                <div className="h-1 gradient-primary" />
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            ط¢ط±ط§ط، ط§ظ„ظ…ط±ط¶ظ‰
                            {reviewsData && (
                                <Badge variant="secondary" className="font-bold">{reviewsData.totalReviews} طھظ‚ظٹظٹظ…</Badge>
                            )}
                        </CardTitle>
                        <Button size="sm" className="gradient-primary text-white gap-2 shadow-glow"
                            onClick={() => {
                                if (myReview) { setReviewRating(myReview.rating); setReviewComment(myReview.comment || ''); }
                                setReviewOpen(true);
                            }}>
                            <Star className="h-4 w-4" />
                            {myReview ? 'طھط¹ط¯ظٹظ„ طھظ‚ظٹظٹظ…ظƒ' : 'ط£ط¶ظپ طھظ‚ظٹظٹظ…ظƒ'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {reviewsData && reviewsData.totalReviews > 0 && (
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-xl border">
                            <div className="text-center flex-shrink-0">
                                <p className="text-5xl font-black">{reviewsData.avgRating}</p>
                                <div className="flex items-center gap-0.5 justify-center mt-1">
                                    {[1,2,3,4,5].map((s) => (
                                        <Star key={s} className={cn('h-4 w-4', s <= Math.round(reviewsData.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')} />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{reviewsData.totalReviews} طھظ‚ظٹظٹظ…</p>
                            </div>
                            <div className="flex-1 space-y-1.5 w-full">
                                {[5,4,3,2,1].map((star) => {
                                    const d = reviewsData.distribution?.find((x: any) => x.star === star);
                                    const count = d?.count || 0;
                                    const pct = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <span className="text-xs w-4 text-right font-bold text-muted-foreground">{star}</span>
                                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground w-4">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {!reviewsData || reviewsData.totalReviews === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Star className="h-12 w-12 text-muted-foreground/20 mb-3" />
                            <p className="text-muted-foreground font-medium">ظ„ط§ طھظˆط¬ط¯ طھظ‚ظٹظٹظ…ط§طھ ط¨ط¹ط¯</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">ظƒظ† ط£ظˆظ„ ظ…ظ† ظٹظ‚ظٹظ‘ظ… ظ‡ط°ظ‡ ط§ظ„ط¹ظٹط§ط¯ط©!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviewsData.reviews.map((review: any) => (
                                <div key={review.id} className="p-4 rounded-xl border bg-background hover:bg-muted/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-black text-sm border border-primary/20">
                                            {review.patientName?.charAt(0) || 'ظ…'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <p className="font-semibold text-sm">{review.patientName}</p>
                                                <div className="flex items-center gap-0.5">
                                                    {[1,2,3,4,5].map((s) => (
                                                        <Star key={s} className={cn('h-3.5 w-3.5', s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20')} />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.comment}</p>}
                                            <p className="text-[11px] text-muted-foreground/50 mt-1.5">{format(new Date(review.createdAt), 'dd MMM yyyy', { locale: ar })}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* â”€â”€ Dialog ط§ظ„طھظ‚ظٹظٹظ… â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            {myReview ? 'طھط¹ط¯ظٹظ„ طھظ‚ظٹظٹظ…ظƒ' : 'ط£ط¶ظپ طھظ‚ظٹظٹظ…ظƒ'}
                        </DialogTitle>
                        <DialogDescription>ط´ط§ط±ظƒظ†ط§ ط±ط£ظٹظƒ ظپظٹ {clinic?.clinic_name || clinic?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label>طھظ‚ظٹظٹظ…ظƒ</Label>
                            <div className="flex items-center gap-2 justify-center py-2">
                                {[1,2,3,4,5].map((s) => (
                                    <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-125 focus:outline-none">
                                        <Star className={cn('h-9 w-9 transition-colors', s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300')} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-sm text-muted-foreground font-medium">
                                {reviewRating === 5 ? 'ظ…ظ…طھط§ط² ط¬ط¯ط§ظ‹ ًںŒں' : reviewRating === 4 ? 'ط¬ظٹط¯ ط¬ط¯ط§ظ‹ ًں‘چ' : reviewRating === 3 ? 'ظ…ظ‚ط¨ظˆظ„ ًں†—' : reviewRating === 2 ? 'ط¶ط¹ظٹظپ ًں‘ژ' : 'ط³ظٹط¦ ط¬ط¯ط§ظ‹ â‌Œ'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="review-comment">طھط¹ظ„ظٹظ‚ظƒ (ط§ط®طھظٹط§ط±ظٹ)</Label>
                            <Textarea id="review-comment" placeholder="ط£ط®ط¨ط±ظ†ط§ ط¹ظ† طھط¬ط±ط¨طھظƒ ظ…ط¹ ظ‡ط°ظ‡ ط§ظ„ط¹ظٹط§ط¯ط©..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={reviewLoading} className="flex-1">ط¥ظ„ط؛ط§ط،</Button>
                        <Button className="flex-1 gradient-primary text-white" onClick={handleSubmitReview} disabled={reviewLoading}>
                            {reviewLoading ? <><Loader2 className="h-4 w-4 ml-2 animate-spin" />ط¬ط§ط±ظٹ ط§ظ„ط­ظپط¸...</> : 'ط­ظپط¸ ط§ظ„طھظ‚ظٹظٹظ…'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}

