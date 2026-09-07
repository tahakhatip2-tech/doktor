import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowRight, Save, Plus, Trash2, Loader2, FlaskConical } from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { dataApi } from '@/lib/api';

interface LabResultEntryProps {
    order: any;
    onBack: () => void;
}

interface TestResult {
    testName: string;
    result: string;
    normalRange: string;
    unit: string;
    flag: 'N' | 'H' | 'L';
}

export default function LabResultEntry({ order, onBack }: LabResultEntryProps) {
    const [results, setResults] = useState<TestResult[]>([
        { testName: '', result: '', normalRange: '', unit: '', flag: 'N' }
    ]);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    // If order is completed, we should probably fetch the existing record to view it
    // But for this simple MVP, we assume we are just adding new results if not completed
    
    const addTest = () => {
        setResults([...results, { testName: '', result: '', normalRange: '', unit: '', flag: 'N' }]);
    };

    const removeTest = (index: number) => {
        const newResults = [...results];
        newResults.splice(index, 1);
        setResults(newResults);
    };

    const updateTest = (index: number, field: keyof TestResult, value: string) => {
        const newResults = [...results];
        newResults[index] = { ...newResults[index], [field]: value };
        setResults(newResults);
    };

    const handleSave = async () => {
        // Validate
        if (results.some(r => !r.testName || !r.result)) {
            toastWithSound.error('الرجاء إكمال جميع الحقول المطلوبة (اسم الفحص والنتيجة)');
            return;
        }

        try {
            setSaving(true);
            await dataApi.post('/laboratory/result', {
                orderId: order.id,
                data: {
                    results,
                    notes
                }
            });
            
            // Mark order as completed via appointments API
            await dataApi.put(`/appointments/${order.id}`, { status: 'completed' });
            
            toastWithSound.success('تم حفظ النتائج بنجاح وإرسالها للمريض');
            onBack();
        } catch (error) {
            console.error('Error saving lab result:', error);
            toastWithSound.error('حدث خطأ أثناء حفظ النتائج');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border-red-100 dark:border-red-900/50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-200">
                        <ArrowRight className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <CardTitle className="text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
                            إدخال نتائج الفحوصات
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            طلب رقم #{order.id} - المريض: {order.customerName || order.customer_name}
                        </p>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                    <h3 className="font-bold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4" />
                        النتائج المخبرية
                    </h3>
                    
                    <div className="space-y-4">
                        {results.map((test, idx) => (
                            <div key={idx} className="flex flex-wrap md:flex-nowrap items-start gap-3 p-3 bg-white dark:bg-black/20 border border-slate-100 dark:border-slate-800 rounded-lg relative group">
                                <div className="w-full md:w-1/3">
                                    <Label className="text-xs mb-1 block">اسم الفحص *</Label>
                                    <Input 
                                        placeholder="مثال: Hemoglobin" 
                                        value={test.testName}
                                        onChange={(e) => updateTest(idx, 'testName', e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="w-full md:w-1/5">
                                    <Label className="text-xs mb-1 block">النتيجة *</Label>
                                    <Input 
                                        placeholder="النتيجة" 
                                        value={test.result}
                                        onChange={(e) => updateTest(idx, 'result', e.target.value)}
                                        className="h-9 font-bold"
                                    />
                                </div>
                                <div className="w-full md:w-1/5">
                                    <Label className="text-xs mb-1 block">المعدل الطبيعي</Label>
                                    <Input 
                                        placeholder="مثال: 12.0 - 15.5" 
                                        value={test.normalRange}
                                        onChange={(e) => updateTest(idx, 'normalRange', e.target.value)}
                                        className="h-9"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="w-full md:w-1/6">
                                    <Label className="text-xs mb-1 block">الوحدة</Label>
                                    <Input 
                                        placeholder="مثال: g/dL" 
                                        value={test.unit}
                                        onChange={(e) => updateTest(idx, 'unit', e.target.value)}
                                        className="h-9"
                                        dir="ltr"
                                    />
                                </div>
                                <div className="w-full md:w-1/6">
                                    <Label className="text-xs mb-1 block">مؤشر</Label>
                                    <select 
                                        value={test.flag}
                                        onChange={(e) => updateTest(idx, 'flag', e.target.value as 'N'|'H'|'L')}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="N">طبيعي (N)</option>
                                        <option value="H">مرتفع (H)</option>
                                        <option value="L">منخفض (L)</option>
                                    </select>
                                </div>
                                <div className="pt-5">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => removeTest(idx)}
                                        disabled={results.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <Button 
                        variant="outline" 
                        className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={addTest}
                    >
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة فحص آخر
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">ملاحظات الطبيب / أخصائي المختبر (اختياري)</Label>
                    <Textarea 
                        placeholder="أدخل أي ملاحظات إضافية حول النتائج..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={onBack}>
                        إلغاء
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[150px]"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                <Save className="h-4 w-4 ml-2" />
                                حفظ واعتماد النتيجة
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
