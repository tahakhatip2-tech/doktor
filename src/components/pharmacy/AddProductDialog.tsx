import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, RefreshCw } from 'lucide-react';
import Barcode from 'react-barcode';
import { API_URL } from '@/lib/api';

const pharmacyFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('pharmacy_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    category: '',
    supplier: '',
  });

  const generateBarcode = () => {
    // Generate a random 12-digit number for the barcode
    const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setFormData(prev => ({ ...prev, barcode: randomBarcode }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await pharmacyFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormData({ name: '', barcode: '', purchasePrice: 0, sellingPrice: 0, stock: 0, category: '', supplier: '' });
      onOpenChange(false);
      window.dispatchEvent(new Event('inventory-updated'));
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الدواء');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-0" dir="rtl">
        <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-emerald-900">
              إضافة دواء جديد
            </DialogTitle>
            <p className="text-xs font-bold text-emerald-600 mt-1">أدخل معلومات الصنف بدقة لضمان محاسبة صحيحة</p>
          </div>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-bold text-slate-600">اسم الدواء *</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl border-slate-200 focus-visible:border-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">الباركود</Label>
              <div className="flex items-center gap-2">
                <Input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="rounded-xl border-slate-200 focus-visible:border-emerald-500 font-mono flex-1" />
                <Button variant="outline" size="icon" className="rounded-xl flex-shrink-0" onClick={generateBarcode} type="button" title="توليد باركود تلقائي">
                  <RefreshCw className="h-4 w-4 text-emerald-600" />
                </Button>
              </div>
              {formData.barcode && (
                <div className="mt-2 bg-white p-2 rounded-lg border border-slate-200 flex justify-center overflow-hidden">
                  <Barcode value={formData.barcode} height={40} width={1.5} fontSize={12} margin={0} background="transparent" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">التصنيف</Label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="مثال: مسكنات" className="rounded-xl border-slate-200 focus-visible:border-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">سعر الشراء (التكلفة) *</Label>
              <Input type="number" step="0.01" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="rounded-xl border-slate-200 focus-visible:border-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">سعر البيع *</Label>
              <Input type="number" step="0.01" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="rounded-xl border-slate-200 focus-visible:border-emerald-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">المخزون الحالي</Label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="rounded-xl border-slate-200 focus-visible:border-emerald-500" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">المورد</Label>
              <Input value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="rounded-xl border-slate-200 focus-visible:border-emerald-500" />
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-xl font-bold border-slate-200">إلغاء</Button>
          <Button onClick={handleSave} disabled={loading} className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600">
            {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
