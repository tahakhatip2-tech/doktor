import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Package, Search, Plus, Edit2, Trash2, AlertTriangle, Box, Printer, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Barcode from 'react-barcode';
import { HeroSection } from '@/components/HeroSection';

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

export default function InventoryManager({ initialOpenAdd = false }: { initialOpenAdd?: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isOpen, setIsOpen] = useState(initialOpenAdd);
  const [editingItem, setEditingItem] = useState<any>(null);
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

  const printBarcode = (barcodeStr: string, itemName: string) => {
    if (!barcodeStr) {
      alert("هذا المنتج لا يمتلك باركود لطباعته");
      return;
    }
    
    // Create an iframe to print the barcode specifically
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>طباعة الباركود</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          @page { size: auto; margin: 0mm; }
          body { 
            margin: 0; 
            padding: 10px; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center;
            font-family: sans-serif;
          }
          .name { font-size: 14px; font-weight: bold; margin-bottom: 5px; text-align: center; }
          svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div class="name">${itemName}</div>
        <svg id="barcode"></svg>
        <script>
          JsBarcode("#barcode", "${barcodeStr}", {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 14,
            margin: 10
          });
          window.onload = function() {
            window.print();
            setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(content);
    iframe.contentWindow?.document.close();
  };

  useEffect(() => {
    loadInventory();

    const handleUpdate = () => loadInventory();
    window.addEventListener('inventory-updated', handleUpdate);
    return () => window.removeEventListener('inventory-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (initialOpenAdd) {
      openNew();
    }
  }, [initialOpenAdd]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await pharmacyFetch('/inventory');
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await pharmacyFetch(`/inventory/${editingItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
      } else {
        await pharmacyFetch('/inventory', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsOpen(false);
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدواء؟')) return;
    try {
      await pharmacyFetch(`/inventory/${id}`, { method: 'DELETE' });
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const openNew = () => {
    setEditingItem(null);
    setFormData({ name: '', barcode: '', purchasePrice: 0, sellingPrice: 0, stock: 0, category: '', supplier: '' });
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name, barcode: item.barcode || '', purchasePrice: item.purchasePrice || 0,
      sellingPrice: item.sellingPrice, stock: item.stock, category: item.category || '', supplier: item.supplier || ''
    });
    setIsOpen(true);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.barcode && item.barcode.includes(search))
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in" dir="rtl">
      <HeroSection 
        pageTitle="إدارة المنتجات والأدوية"
        doctorName="نظام الصيدلية"
        backgroundImage="/pharmacy-bg.jpg"
        isPharmacy={true}
        icon={Package}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-emerald-100/50 shadow-sm">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-800 flex items-center gap-2 whitespace-nowrap">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-xl shadow-inner text-white flex-shrink-0">
              <Package className="h-4 w-4" />
            </div>
            إدارة المنتجات والأدوية
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2">أضف وراقب مخزون الصيدلية الخاص بك</p>
        </div>
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative group flex-1 sm:min-w-[280px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="بحث بالاسم أو الباركود..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 h-11 bg-white rounded-full border-2 border-emerald-100 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 text-xs sm:text-sm font-bold shadow-sm transition-all duration-300 w-full"
            />
          </div>
          <Button onClick={openNew} className="h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] transition-all duration-300 px-4 sm:px-6 text-white border-2 border-emerald-400/20 flex-shrink-0">
            <Plus className="h-4 w-4 sm:ml-2" />
            <span className="hidden sm:inline">إضافة دواء</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin shadow-lg" />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map(item => (
            <Card key={item.id} className="relative rounded-3xl border-2 border-emerald-200/60 bg-white/70 backdrop-blur-xl shadow-[0_4px_16px_rgba(52,211,153,0.1)] hover:shadow-[0_8px_24px_rgba(52,211,153,0.2)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
              {/* Glossy top reflection */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/10 to-transparent w-full h-[40%] pointer-events-none rounded-t-3xl z-0"></div>
              
              {item.stock <= 10 && (
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 z-10" />
              )}
              
              <CardContent className="p-5 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${item.stock <= 10 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'}`}>
                      <Box className="h-6 w-6 opacity-90" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-1">{item.name}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-full">{item.category || 'بدون تصنيف'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5 bg-white/50 rounded-2xl p-3 border border-emerald-100 shadow-sm">
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl p-2 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 mb-0.5">سعر البيع</span>
                    <span className="font-black text-emerald-600 text-sm">{Number(item.sellingPrice).toFixed(2)} د.أ</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl p-2 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 mb-0.5">المخزون</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-black text-sm ${item.stock <= 10 ? 'text-amber-600' : 'text-slate-700'}`}>{item.stock}</span>
                      {item.stock <= 10 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full rounded-xl border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 shadow-sm text-xs font-bold transition-all" onClick={() => printBarcode(item.barcode, item.name)}>
                    <Printer className="h-3.5 w-3.5 mr-1.5" /> طباعة الباركود
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 shadow-sm text-xs font-bold transition-all" onClick={() => openEdit(item)}>
                      <Edit2 className="h-3 w-3 mr-1.5" /> تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="px-3 rounded-xl border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 shadow-sm transition-all" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl">
          <Package className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-black text-slate-700 mb-1">لا توجد أدوية</h3>
          <p className="text-sm font-bold text-slate-400">لم يتم العثور على أي عناصر في المخزون</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-0" dir="rtl">
          <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-emerald-900">
                {editingItem ? 'تعديل بيانات الدواء' : 'إضافة دواء جديد'}
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
            <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl font-bold border-slate-200">إلغاء</Button>
            <Button onClick={handleSave} className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600">
              حفظ البيانات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
