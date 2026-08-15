import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DermatologyData {
  // تفاصيل التقييم
  skinType: string;
  treatmentType: string;
  targetArea: string[];
  // تفاصيل الجلسة
  sessionNumber: string;
  deviceUsed: string;
  deviceSettings: string; // طاقة الليزر، عدد الوحدات، الخ
  // العلاج والملاحظات
  diagnosis: string; // المشكلة (تصبغات، تجاعيد، الخ)
  treatment: string; // المنتجات الموصوفة
  postCareInstructions: string;
  notes: string;
}

const SKIN_TYPES = [
  'عادية (Normal)',
  'جافة (Dry)',
  'دهنية (Oily)',
  'مختلطة (Combination)',
  'حساسة (Sensitive)',
  'معرضة لحب الشباب (Acne-prone)',
];

const TREATMENT_TYPES = [
  'إزالة شعر بالليزر (Laser Hair Removal)',
  'فراكشنال ليزر (Fractional Laser)',
  'حقن بوتكس (Botox)',
  'حقن فيلر (Fillers)',
  'علاج بلازما (PRP)',
  'تقشير كيميائي (Chemical Peel)',
  'تنظيف بشرة (HydraFacial)',
  'ميزوثيراپي (Mesotherapy)',
  'أخرى',
];

const TARGET_AREAS = [
  'الوجه بالكامل',
  'الجبهة',
  'حول العينين',
  'الخدود',
  'الشفتين',
  'الرقبة',
  'اليدين',
  'الجسم',
  'فروة الرأس',
];

const DEFAULT_DATA: DermatologyData = {
  skinType: '',
  treatmentType: '',
  targetArea: [],
  sessionNumber: '1',
  deviceUsed: '',
  deviceSettings: '',
  diagnosis: '',
  treatment: '',
  postCareInstructions: '',
  notes: '',
};

// ─── Input Form Component ─────────────────────────────────────────────────────
const DermatologyTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: DermatologyData = { ...DEFAULT_DATA, ...value, targetArea: value?.targetArea || [] };

  const update = (field: keyof DermatologyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const toggleArea = (area: string) => {
    const current = data.targetArea;
    const updated = current.includes(area)
      ? current.filter((a) => a !== area)
      : [...current, area];
    update('targetArea', updated);
  };

  return (
    <div className="space-y-5 p-1" dir="rtl">
      <h3 className="font-bold text-pink-700 flex items-center gap-2 text-base">
        ✨ بيانات الجلدية والتجميل
      </h3>

      {/* ── Assessment ── */}
      <div className="bg-pink-50 rounded-xl p-4 space-y-4">
        <p className="text-xs font-black text-pink-600 uppercase tracking-widest">📝 التقييم ونوع الإجراء</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">نوع الإجراء التجميلي / العلاجي</label>
            <select
              value={data.treatmentType}
              onChange={(e) => update('treatmentType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            >
              <option value="">اختر الإجراء...</option>
              {TREATMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">نوع البشرة</label>
            <select
              value={data.skinType}
              onChange={(e) => update('skinType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
            >
              <option value="">اختر نوع البشرة...</option>
              {SKIN_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">المناطق المستهدفة:</p>
          <div className="flex flex-wrap gap-2">
            {TARGET_AREAS.map((area) => (
              <button
                key={area} type="button" onClick={() => toggleArea(area)}
                className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                  data.targetArea.includes(area) ? 'bg-pink-500 text-white border-pink-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:text-pink-600'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Session Details ── */}
      <div className="border border-pink-100 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-pink-600 uppercase tracking-widest">⚙️ تفاصيل الجلسة والأجهزة</p>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-600">رقم الجلسة:</label>
            <input type="number" value={data.sessionNumber} onChange={(e) => update('sessionNumber', e.target.value)} min="1"
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">الجهاز المستخدم / المادة</label>
            <input type="text" value={data.deviceUsed} onChange={(e) => update('deviceUsed', e.target.value)}
              placeholder="مثال: Candela GentlePro, Allergan Botox..."
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">الإعدادات / الكمية (الوحدات)</label>
            <input type="text" value={data.deviceSettings} onChange={(e) => update('deviceSettings', e.target.value)}
              placeholder="مثال: 12 Joules, 20 Units..."
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-left" dir="ltr" />
          </div>
        </div>
      </div>

      {/* ── Diagnosis & Post-Care ── */}
      <div className="border-t border-dashed border-pink-200 pt-4 space-y-3">
        <p className="text-xs font-black text-pink-600 uppercase tracking-widest mb-1">💊 التشخيص والعناية</p>
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">الحالة / المشكلة الأساسية</label>
          <textarea value={data.diagnosis} onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="مثال: تصبغات جلدية، تجاعيد تعبيرية، حب شباب نشط..." rows={1}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">المنتجات أو الأدوية الموصوفة</label>
          <textarea value={data.treatment} onChange={(e) => update('treatment', e.target.value)}
            placeholder="كريمات تفتيح، مضاد حيوي، غسول..." rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">تعليمات ما بعد الجلسة (Post-care)</label>
          <textarea value={data.postCareInstructions} onChange={(e) => update('postCareInstructions', e.target.value)}
            placeholder="تجنب التعرض للشمس، استخدام واقي شمس، عدم غسل الوجه لـ 4 ساعات..." rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const DermatologyViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as DermatologyData;
  if (!d) return null;

  return (
    <div className="bg-pink-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-pink-800 flex items-center gap-2">✨ سجل الجلدية والتجميل</h4>

      <div className="flex flex-wrap gap-2">
        {d.treatmentType && (
          <span className="bg-pink-600 text-white font-bold rounded-lg px-3 py-1 text-sm shadow-sm">
            {d.treatmentType}
          </span>
        )}
        {d.sessionNumber && (
          <span className="bg-white rounded-lg px-3 py-1 border border-pink-200 text-sm font-semibold text-pink-700">
            الجلسة رقم: {d.sessionNumber}
          </span>
        )}
        {d.skinType && <span className="bg-white rounded-lg px-3 py-1 border border-pink-100 text-sm"><strong>البشرة:</strong> {d.skinType}</span>}
      </div>

      {d.targetArea?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">المناطق المعالجة:</p>
          <div className="flex flex-wrap gap-1">
            {d.targetArea.map((a: string) => (
              <span key={a} className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>
      )}

      {(d.deviceUsed || d.deviceSettings) && (
        <div className="bg-white rounded-lg p-2 border border-pink-100 grid grid-cols-2 gap-2">
          {d.deviceUsed && <p className="text-sm text-gray-700"><strong>الجهاز/المادة:</strong> {d.deviceUsed}</p>}
          {d.deviceSettings && <p className="text-sm text-gray-700" dir="ltr"><strong dir="rtl">الإعدادات:</strong> {d.deviceSettings}</p>}
        </div>
      )}

      {d.diagnosis && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-pink-100"><strong>🩺 الحالة:</strong> {d.diagnosis}</p>}
      {d.treatment && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-pink-100"><strong>🧴 المنتجات:</strong> {d.treatment}</p>}
      {d.postCareInstructions && (
        <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
          <p className="text-sm font-bold text-amber-800 mb-1">⚠️ تعليمات العناية:</p>
          <p className="text-sm text-amber-900">{d.postCareInstructions}</p>
        </div>
      )}
      {d.notes && <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-100"><strong>ملاحظات:</strong> {d.notes}</p>}
    </div>
  );
};

export default DermatologyTemplate;
