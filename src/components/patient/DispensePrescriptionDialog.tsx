import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pill, Building2, MapPin, Loader2, FileText, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import axios from 'axios';
import { toastWithSound } from '@/lib/toast-with-sound';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface DispensePrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function DispensePrescriptionDialog({ open, onOpenChange }: DispensePrescriptionDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
    
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [loadingPharmacies, setLoadingPharmacies] = useState(false);

    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (open) {
            setStep(1);
            setSelectedPrescription(null);
            fetchPrescriptions();
        }
    }, [open]);

    const fetchPrescriptions = async () => {
        setLoadingPrescriptions(true);
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/prescriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Only show PENDING prescriptions
            const pending = res.data.filter((p: any) => p.status === 'PENDING');
            setPrescriptions(pending);
        } catch (err) {
            toastWithSound.error('فشل في جلب الوصفات');
        } finally {
            setLoadingPrescriptions(false);
        }
    };

    const fetchPharmacies = async () => {
        setLoadingPharmacies(true);
        try {
            const token = localStorage.getItem('patient_token');
            const res = await axios.get(`${API_URL}/patient/pharmacies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPharmacies(res.data);
        } catch (err) {
            toastWithSound.error('فشل في جلب الصيدليات');
        } finally {
            setLoadingPharmacies(false);
        }
    };

    const handleSelectPrescription = (prescription: any) => {
        setSelectedPrescription(prescription);
        setStep(2);
        if (pharmacies.length === 0) {
            fetchPharmacies();
        }
    };

    const handleSendToPharmacy = async (pharmacy: any) => {
        if (!selectedPrescription) return;
        setSending(true);
        try {
            const token = localStorage.getItem('patient_token');
            await axios.post(
                `${API_URL}/patient/prescriptions/${selectedPrescription.id}/send-to-pharmacy`,
                { pharmacyId: pharmacy.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Create WhatsApp message text to send via the user's phone if desired
            const doctorName = selectedPrescription.doctor?.name || 'طبيب';
            const message = `مرحباً، لدي وصفة طبية جديدة مرسلة من د. ${doctorName} عبر تطبيق حكيم. يرجى تجهيزها.`;
            const phone = pharmacy.clinic_phone || pharmacy.phone || '';
            
            toastWithSound.success('تم إرسال الوصفة للصيدلية بنجاح داخل النظام');
            onOpenChange(false);

            if (phone) {
                // Remove leading zeros or +, then construct wa.me link
                let waPhone = phone.replace(/\D/g, '');
                if (waPhone.startsWith('0')) waPhone = '962' + waPhone.substring(1); // Assuming Jordan if no country code, or just pass as is
                const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
                // Give user a tiny delay to see the success toast then open WhatsApp
                setTimeout(() => {
                    window.open(waUrl, '_blank');
                }, 1000);
            }

        } catch (err: any) {
            toastWithSound.error(err.response?.data?.message || 'حدث خطأ أثناء الإرسال');
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl sm:rounded-2xl max-w-[90vw] sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col font-sans p-0" dir="rtl">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
                    <DialogTitle className="flex items-center gap-2 text-blue-950 font-black">
                        {step === 1 ? (
                            <>
                                <FileText className="h-5 w-5 text-blue-600" />
                                صرف وصفة طبية
                            </>
                        ) : (
                            <>
                                <button onClick={() => setStep(1)} className="p-1 -ml-2 rounded-lg hover:bg-slate-200 text-slate-500">
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                                اختر الصيدلية
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold text-slate-500 mt-2">
                        {step === 1 
                            ? 'اختر الوصفة التي ترغب بإرسالها للصيدلية لصرفها.'
                            : 'اختر الصيدلية لإرسال الوصفة الحالية إليها عبر النظام والواتساب.'}
                    </DialogDescription>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {step === 1 ? (
                        /* STEP 1: PRESCRIPTIONS */
                        loadingPrescriptions ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                <p className="text-sm font-bold text-slate-500">جاري تحميل الوصفات...</p>
                            </div>
                        ) : prescriptions.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                                <Pill className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-500">لا توجد وصفات قيد الانتظار حالياً</p>
                            </div>
                        ) : (
                            prescriptions.map((prescription) => {
                                let meds = [];
                                try {
                                    meds = typeof prescription.medications === 'string' ? JSON.parse(prescription.medications) : prescription.medications;
                                } catch(e) {}

                                return (
                                    <div 
                                        key={prescription.id} 
                                        onClick={() => handleSelectPrescription(prescription)}
                                        className="bg-white border border-blue-100 rounded-2xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Pill className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800">وصفة طبية من د. {prescription.doctor?.name}</p>
                                                <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">{prescription.notes || 'لا يوجد ملاحظات إضافية'}</p>
                                                
                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                    {Array.isArray(meds) && meds.map((m: any, idx: number) => (
                                                        <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                                            {m.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <ArrowLeft className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors mt-3" />
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        /* STEP 2: PHARMACIES */
                        loadingPharmacies ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                                <p className="text-sm font-bold text-slate-500">جاري تحميل الصيدليات...</p>
                            </div>
                        ) : pharmacies.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                                <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-500">لا توجد صيدليات متاحة حالياً</p>
                            </div>
                        ) : (
                            pharmacies.map((pharmacy) => (
                                <div 
                                    key={pharmacy.id} 
                                    onClick={() => !sending && handleSendToPharmacy(pharmacy)}
                                    className={`bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group ${sending ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-800 truncate">{pharmacy.clinic_name || pharmacy.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-1 truncate">
                                                <MapPin className="h-3 w-3" /> {pharmacy.clinic_address || 'غير محدد'}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Button size="sm" disabled={sending} className="h-9 rounded-xl font-bold bg-slate-100 text-blue-700 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm px-4">
                                                إرسال
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
