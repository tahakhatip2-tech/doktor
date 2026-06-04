import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Activity, Syringe, Save, FastForward, Loader2, TestTube, Check, Plus, Image as ImageIcon } from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { appointmentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProceduresDialogProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    onSuccess: () => void;
}

const COMMON_TESTS = [
    'ضغط الدم',
    'فحص السكري',
    'قياس الحرارة',
    'نسبة الأكسجين',
    'تخطيط قلب (ECG)',
    'فحص نظر'
];

const COMMON_PROCEDURES = [
    'إعطاء إبرة/حقنة',
    'تبخيرة (Nebulizer)',
    'غيار جرح',
    'تنظيف أذن',
    'إزالة غرز',
    'تضميد'
];

export default function ProceduresDialog({
    isOpen,
    onClose,
    appointment,
    onSuccess
}: ProceduresDialogProps) {
    const [loading, setLoading] = useState(false);
    
    const [selectedTests, setSelectedTests] = useState<string[]>([]);
    const [testReadings, setTestReadings] = useState<Record<string, string>>({});
    const [otherTests, setOtherTests] = useState('');
    
    const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
    const [procedureDetails, setProcedureDetails] = useState<Record<string, string>>({});
    const [otherProcedures, setOtherProcedures] = useState('');

    // Reset data when dialog opens
    useEffect(() => {
        if (isOpen && appointment) {
            // Because previous format was a concatenated string, we will dump it to "other" to avoid losing data
            // If we implement a complex parser, we can populate `selectedTests` and `testReadings`, but for simplicity:
            setOtherTests(appointment.initialTests === 'لا يوجد' ? '' : (appointment.initialTests || ''));
            setOtherProcedures(appointment.medicalProcedures === 'لا يوجد' ? '' : (appointment.medicalProcedures || ''));
            setSelectedTests([]);
            setTestReadings({});
            setSelectedProcedures([]);
            setProcedureDetails({});
        }
    }, [isOpen, appointment]);

    const toggleTest = (test: string) => {
        setSelectedTests(prev => {
            if (prev.includes(test)) {
                const next = prev.filter(t => t !== test);
                // optionally clear reading
                const newReadings = { ...testReadings };
                delete newReadings[test];
                setTestReadings(newReadings);
                return next;
            } else {
                return [...prev, test];
            }
        });
    };

    const toggleProcedure = (proc: string) => {
        setSelectedProcedures(prev => {
            if (prev.includes(proc)) {
                const next = prev.filter(p => p !== proc);
                const newDetails = { ...procedureDetails };
                delete newDetails[proc];
                setProcedureDetails(newDetails);
                return next;
            } else {
                return [...prev, proc];
            }
        });
    };

    const handleReadingChange = (test: string, val: string) => {
        setTestReadings(prev => ({ ...prev, [test]: val }));
    };

    const handleDetailChange = (proc: string, val: string) => {
        setProcedureDetails(prev => ({ ...prev, [proc]: val }));
    };

    const formatData = (selectedList: string[], detailsMap: Record<string, string>, otherText: string) => {
        const parts = selectedList.map(item => {
            const val = detailsMap[item];
            return val ? `${item} (${val})` : item;
        });
        if (otherText.trim()) parts.push(otherText.trim());
        return parts.join('، ');
    };

    const handleSave = async (skip: boolean = false) => {
        setLoading(true);
        try {
            const testsStr = formatData(selectedTests, testReadings, otherTests);
            const proceduresStr = formatData(selectedProcedures, procedureDetails, otherProcedures);

            const payload = skip ? {
                initialTests: testsStr || 'لا يوجد',
                medicalProcedures: proceduresStr || 'لا يوجد',
            } : {
                initialTests: testsStr,
                medicalProcedures: proceduresStr,
            };

            await appointmentsApi.updateProcedures(appointment.id, payload);
            toastWithSound.success(skip ? 'تم التخطي بنجاح' : 'تم حفظ الفحوصات والإجراءات بنجاح');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving procedures:', error);
            toastWithSound.error('حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    const hasData = selectedTests.length > 0 || otherTests.trim().length > 0 || selectedProcedures.length > 0 || otherProcedures.trim().length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2rem] border-0 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-8 text-white text-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                            <TestTube className="h-8 w-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-black mb-2">الفحوصات والإجراءات</DialogTitle>
                        <DialogDescription className="text-blue-100 font-medium">
                            سجل الفحوصات الأولية للمريض 
                            <span className="font-bold text-white mx-1">{appointment?.customerName || appointment?.patient_name}</span>
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-6 space-y-8 bg-slate-50/50">
                    {/* Initial Tests Section */}
                    <div className="space-y-4">
                        <Label className="font-bold flex items-center gap-2 text-slate-700 text-lg border-b pb-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            الفحوصات الأولية السريعة
                        </Label>
                        
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TESTS.map(test => {
                                const isSelected = selectedTests.includes(test);
                                return (
                                    <button
                                        key={test}
                                        onClick={() => toggleTest(test)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 flex items-center gap-2 select-none",
                                            isSelected 
                                                ? "bg-blue-100 border-blue-500 text-blue-700 shadow-sm" 
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 opacity-50" />}
                                        {test}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dynamic Inputs for Selected Tests */}
                        {selectedTests.length > 0 && (
                            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-3 shadow-inner">
                                <Label className="text-sm font-bold text-blue-800">قراءات الفحوصات المحددة:</Label>
                                {selectedTests.map(test => (
                                    <div key={test} className="flex items-center gap-3">
                                        <div className="w-1/3 min-w-[100px] text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            {test}
                                        </div>
                                        <Input 
                                            placeholder={`أدخل نتيجة ${test}...`}
                                            value={testReadings[test] || ''}
                                            onChange={(e) => handleReadingChange(test, e.target.value)}
                                            className="flex-1 h-9 rounded-lg border-slate-200 bg-white"
                                        />
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-blue-600" title="إرفاق صورة">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Textarea
                            placeholder="قراءات أو فحوصات إضافية (مثال: ضغط الدم 120/80)..."
                            className="min-h-[80px] rounded-2xl bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm resize-none text-base mt-2"
                            value={otherTests}
                            onChange={(e) => setOtherTests(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Medical Procedures Section */}
                    <div className="space-y-4">
                        <Label className="font-bold flex items-center gap-2 text-slate-700 text-lg border-b pb-2">
                            <Syringe className="h-5 w-5 text-orange-500" />
                            الإجراءات الطبية المتخذة
                        </Label>
                        
                        <div className="flex flex-wrap gap-2">
                            {COMMON_PROCEDURES.map(proc => {
                                const isSelected = selectedProcedures.includes(proc);
                                return (
                                    <button
                                        key={proc}
                                        onClick={() => toggleProcedure(proc)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 flex items-center gap-2 select-none",
                                            isSelected 
                                                ? "bg-orange-100 border-orange-500 text-orange-700 shadow-sm" 
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 opacity-50" />}
                                        {proc}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dynamic Inputs for Selected Procedures */}
                        {selectedProcedures.length > 0 && (
                            <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100 space-y-3 shadow-inner">
                                <Label className="text-sm font-bold text-orange-800">تفاصيل الإجراءات المحددة:</Label>
                                {selectedProcedures.map(proc => (
                                    <div key={proc} className="flex items-center gap-3">
                                        <div className="w-1/3 min-w-[100px] text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            {proc}
                                        </div>
                                        <Input 
                                            placeholder={`أدخل تفاصيل ${proc}...`}
                                            value={procedureDetails[proc] || ''}
                                            onChange={(e) => handleDetailChange(proc, e.target.value)}
                                            className="flex-1 h-9 rounded-lg border-slate-200 bg-white"
                                        />
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-orange-600" title="إرفاق صورة">
                                            <ImageIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Textarea
                            placeholder="تفاصيل إجراءات أخرى..."
                            className="min-h-[80px] rounded-2xl bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500 shadow-sm resize-none text-base mt-2"
                            value={otherProcedures}
                            onChange={(e) => setOtherProcedures(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3 sticky bottom-0 z-10">
                    <Button 
                        onClick={() => handleSave(false)}
                        disabled={loading || !hasData}
                        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-lg shadow-blue-500/20 transition-all duration-300"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Save className="h-5 w-5 ml-2" />}
                        حفظ القراءات والإجراءات
                    </Button>
                    <Button 
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold rounded-xl text-base transition-all duration-300"
                    >
                        <FastForward className="h-5 w-5 ml-2" />
                        تخطي للإتمام
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
