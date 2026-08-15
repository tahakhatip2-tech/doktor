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
    const [scanError, setScanError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const isProcessingRef = useRef(false); // prevent duplicate scans

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        if (isOpen && !scannedPrescription && !scannerInit && !scanError) {
            // Wait for Dialog to mount in DOM
            timeoutId = setTimeout(() => {
                const readerElement = document.getElementById("reader");
                if (!readerElement) return;

                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );
                scannerRef.current = scanner;

                scanner.render(
                    (decodedText) => {
                        // Prevent duplicate processing
                        if (isProcessingRef.current) return;
                        isProcessingRef.current = true;
                        // Pause scanner immediately
                        try { scanner.pause(true); } catch {}
                        handleScanSuccess(decodedText);
                    },
                    (_error) => {
                        // Ignore normal scanning errors
                    }
                );
                setScannerInit(true);
            }, 300);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
                setScannerInit(false);
            }
        };
    }, [isOpen, scannedPrescription, scanError]);

    const handleScanSuccess = async (prescriptionId: string) => {
        setLoading(true);
        setScanError(null);
        try {
            const token = localStorage.getItem('pharmacy_token');
            // Clean the scanned value (remove whitespace/newlines)
            const cleanId = prescriptionId.trim();
            const numericId = parseInt(cleanId);
            if (isNaN(numericId)) {
                throw new Error('رمز QR غير صالح');
            }
            const res = await axios.get(`${API_URL}/pharmacy/prescriptions/${numericId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            setScannedPrescription(res.data);
            isProcessingRef.current = false;
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message || 'لم يتم العثور على الوصفة';
            setScanError(msg);
            toast({
                variant: 'destructive',
                title: 'خطأ في قراءة الوصفة',
                description: msg,
            });
            isProcessingRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async () => {
        if (!scannedPrescription) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('pharmacy_token');
            await axios.patch(`${API_URL}/pharmacy/prescriptions/${scannedPrescription.id}/dispense`, {}, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
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
        setScanError(null);
        setScannerInit(false);
        isProcessingRef.current = false;
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
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
                if (scannerRef.current) { scannerRef.current.clear().catch(console.error); scannerRef.current = null; }
                setScannerInit(false);
                setScannedPrescription(null);
                setScanError(null);
                isProcessingRef.current = false;
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
                    ) : scanError ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-red-700 text-sm">فشل في قراءة الوصفة</p>
                                <p className="text-slate-500 text-xs mt-1">{scanError}</p>
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={resetScan}
                            >
                                <Search className="h-4 w-4 ml-2" />
                                إعادة المسح
                            </Button>
                        </div>
                    ) : scannedPrescription ? (
                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-blue-900">
                                        مريض: {scannedPrescription.patient?.fullName || scannedPrescription.patient?.name}
                                    </h3>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                                        scannedPrescription.status === 'DISPENSED' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {scannedPrescription.status === 'DISPENSED' ? 'تم الصرف' : 'بانتظار الصرف'}
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
