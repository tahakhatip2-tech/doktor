import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode, Search, CheckCircle2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface QRScannerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onDispenseSuccess: () => void;
}

export default function QRScannerDialog({ isOpen, onClose, onDispenseSuccess }: QRScannerDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [scannedPrescription, setScannedPrescription] = useState<any>(null);
    const [scannerInit, setScannerInit] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isOpen && !scannedPrescription && !scannerInit) {
            // Start scanner
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            scannerRef.current = scanner;

            scanner.render(
                (decodedText) => {
                    // Success callback
                    scanner.pause(true);
                    handleScanSuccess(decodedText);
                },
                (error) => {
                    // Ignore normal scanning errors
                }
            );
            setScannerInit(true);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                setScannerInit(false);
            }
        };
    }, [isOpen, scannedPrescription]);

    const handleScanSuccess = async (prescriptionId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('pharmacy_token');
            const res = await axios.get(`${API_URL}/pharmacy/prescriptions/${prescriptionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScannedPrescription(res.data);
            
            toast({
                title: 'تم قراءة الوصفة بنجاح',
                description: 'تم العثور على الوصفة الطبية.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: error.response?.data?.message || 'لم يتم العثور على الوصفة أو لا تملك صلاحية للوصول إليها.'
            });
            // Resume scanning on error
            if (scannerRef.current) {
                scannerRef.current.resume();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async () => {
        if (!scannedPrescription) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('pharmacy_token');
            await axios.post(`${API_URL}/pharmacy/prescriptions/${scannedPrescription.id}/dispense`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: 'تم صرف الوصفة بنجاح',
                description: 'تم تحديث حالة الوصفة وإشعار المريض.',
            });
            onDispenseSuccess();
            onClose(); // Close dialog on success
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: error.response?.data?.message || 'حدث خطأ أثناء صرف الوصفة'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setScannedPrescription(null);
        if (scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    const renderMedications = (medsString: string) => {
        try {
            const meds = JSON.parse(medsString);
            return (
                <div className="space-y-3 mt-4">
                    <h4 className="font-bold text-slate-800 text-sm">الأدوية الموصوفة:</h4>
                    {meds.map((med: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="font-black text-slate-900">{med.name}</span>
                                <span className="text-slate-600 text-xs px-2 py-0.5 bg-slate-200 rounded-full">{med.type}</span>
                            </div>
                            <div className="text-slate-700 text-xs font-medium flex gap-3">
                                <span>الجرعة: {med.frequency}</span>
                                <span className="text-slate-400">|</span>
                                <span>المدة: {med.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        } catch {
            return <p className="text-sm text-slate-500 mt-2">لا يمكن عرض الأدوية (تنسيق غير صالح)</p>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                if (scannerRef.current) scannerRef.current.clear().catch(console.error);
                setScannerInit(false);
                setScannedPrescription(null);
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-blue-900">
                        <QrCode className="h-6 w-6 text-blue-600" />
                        مسح الوصفة الطبية (QR)
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                            <p className="text-slate-500 text-sm font-medium">جاري معالجة البيانات...</p>
                        </div>
                    ) : scannedPrescription ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-blue-900">
                                        مريض: {scannedPrescription.patient?.name}
                                    </h3>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                                        scannedPrescription.status === 'DISPENSED' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {scannedPrescription.status === 'DISPENSED' ? 'مصروفة' : 'بانتظار الصرف'}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium text-slate-800">العيادة:</span> {scannedPrescription.doctor?.clinic_name || scannedPrescription.doctor?.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    تاريخ الإصدار: {format(new Date(scannedPrescription.createdAt), 'dd MMMM yyyy hh:mm a', { locale: ar })}
                                </p>
                            </div>

                            {scannedPrescription.medications && renderMedications(scannedPrescription.medications)}

                            {scannedPrescription.notes && (
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mt-4">
                                    <h4 className="font-bold text-amber-800 text-xs mb-1">ملاحظات الطبيب:</h4>
                                    <p className="text-sm text-amber-900">{scannedPrescription.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={resetScan}
                                >
                                    مسح وصفة أخرى
                                </Button>
                                {scannedPrescription.status === 'PENDING' && (
                                    <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={handleDispense}
                                    >
                                        <CheckCircle2 className="h-4 w-4 ml-2" />
                                        صرف الوصفة
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-[300px] overflow-hidden rounded-2xl border-2 border-dashed border-blue-200">
                                <div id="reader" className="w-full"></div>
                            </div>
                            <p className="text-sm text-slate-500 mt-4 text-center">
                                قم بتوجيه كاميرا الجهاز نحو رمز الـ QR الموجود في هاتف المريض
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
