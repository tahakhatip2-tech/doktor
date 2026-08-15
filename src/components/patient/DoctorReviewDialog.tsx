import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Award, Stethoscope, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface DoctorReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: {
        id: number;
        name: string;
        specialty?: string;
        avatar?: string;
    } | null;
    existingReview?: { rating: number; comment?: string } | null;
    onReviewSubmitted?: () => void;
}

export default function DoctorReviewDialog({
    open,
    onOpenChange,
    doctor,
    existingReview,
    onReviewSubmitted,
}: DoctorReviewDialogProps) {
    const [rating, setRating] = useState(5);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            setRating(existingReview?.rating ?? 5);
            setComment(existingReview?.comment ?? '');
            setSuccess(false);
        }
    }, [open, existingReview]);

    if (!doctor) return null;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('patient_token');
            await axios.post(
                `${API_URL}/patient/doctors/${doctor.id}/reviews`,
                { rating, comment: comment.trim() || undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                onReviewSubmitted?.();
            }, 1500);
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'حدث خطأ';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const ratingLabels = ['', 'سيء', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md mx-auto rounded-2xl overflow-hidden p-0" dir="rtl">
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-6 pb-8 relative overflow-hidden">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl font-black text-right sr-only">
                            تقييم الطبيب
                        </DialogTitle>
                    </DialogHeader>

                    {/* Doctor info */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 shrink-0">
                            {doctor.avatar ? (
                                <img
                                    src={doctor.avatar.startsWith('http') || doctor.avatar.startsWith('data:')
                                        ? doctor.avatar
                                        : `${BASE_URL}${doctor.avatar.startsWith('/') ? '' : '/'}${doctor.avatar}`}
                                    alt={doctor.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">
                                    {doctor.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-white font-black text-lg leading-tight">{doctor.name}</p>
                            {doctor.specialty && (
                                <p className="text-blue-200 text-sm font-medium mt-0.5 flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5" />
                                    {doctor.specialty}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {success ? (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <CheckCircle2 className="w-14 h-14 text-green-500" />
                            <p className="text-lg font-bold text-slate-800">شكراً على تقييمك!</p>
                            <p className="text-sm text-slate-500 text-center">تقييمك يساعد المرضى الآخرين على اختيار أفضل طبيب</p>
                        </div>
                    ) : (
                        <>
                            {/* Stars */}
                            <div className="text-center space-y-2">
                                <p className="text-sm font-bold text-slate-600">ما هو تقييمك للطبيب؟</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHovered(star)}
                                            onMouseLeave={() => setHovered(0)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                className={cn(
                                                    'w-9 h-9 transition-colors',
                                                    star <= (hovered || rating)
                                                        ? 'text-amber-400 fill-amber-400'
                                                        : 'text-slate-200 fill-slate-200'
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {(hovered || rating) > 0 && (
                                    <p className="text-sm font-bold text-amber-600 animate-fade-in">
                                        {ratingLabels[hovered || rating]}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-blue-500" />
                                    تعليقك (اختياري)
                                </label>
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="شاركنا تجربتك مع هذا الطبيب..."
                                    className="resize-none rounded-xl border-slate-200 focus:border-blue-400 text-sm"
                                    rows={3}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl font-bold"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-md"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin ml-1" /> جاري الإرسال...</>
                                    ) : (
                                        <><Star className="w-4 h-4 ml-1 fill-amber-300 text-amber-300" />{existingReview ? 'تحديث التقييم' : 'إرسال التقييم'}</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
