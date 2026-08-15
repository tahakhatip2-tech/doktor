import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EndocrinologyData {
  // السكري
  fbs: string; // Fasting Blood Sugar
  rbs: string; // Random Blood Sugar
  hba1c: string; // التراكمي
  // قياسات الجسم
  weight: string;
  height: string;
  bmi: string;
  // الغدة الدرقية
  tsh: string;
  freeT4: string;
  // تفاصيل
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
}

const ENDO_SYMPTOMS = [
  'كثرة التبول',
  'عطش شديد',
  'جوع مستمر',
  'فقدان وزن غير مبرر',
  'زيادة وزن',
  'تعب وإرهاق',
  'تنميل الأطراف',
  'ضبابية الرؤية',
  'خفقان القلب',
  'تساقط الشعر',
];

const DEFAULT_DATA: EndocrinologyData = {
  fbs: '',
  rbs: '',
  hba1c: '',
  weight: '',
  height: '',
  bmi: '',
  tsh: '',
  freeT4: '',
  symptoms: [],
  diagnosis: '',
  treatment: '',
  notes: '',
};

function calcBMI(weight: string, height: string): string {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return '';
  return (w / (h * h)).toFixed(1);
}

// ─── Input Form Component ─────────────────────────────────────────────────────
const EndocrinologyTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: EndocrinologyData = { ...DEFAULT_DATA, ...value, symptoms: value?.symptoms || [] };

  const update = (field: keyof EndocrinologyData, val: any) => {
    const updated = { ...data, [field]: val };
    if (field === 'weight' || field === 'height') {
      updated.bmi = calcBMI(
        field === 'weight' ? val : data.weight,
        field === 'height' ? val : data.height
      );
    }
    onChange(updated);
  };

  const toggleSymptom = (symptom: string) => {
    const current = data.symptoms;
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    update('symptoms', updated);
  };

  const getStatusColor = (val: string, type: 'fbs' | 'hba1c') => {
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    if (type === 'fbs') {
      if (num < 70) return 'text-blue-600 bg-blue-50'; // منخفض
      if (num <= 100) return 'text-green-600 bg-green-50'; // طبيعي
      if (num <= 125) return 'text-amber-600 bg-amber-50'; // ما قبل السكري
      return 'text-red-600 bg-red-50'; // سكري
    }
    if (type === 'hba1c') {
      if (num < 5.7) return 'text-green-600 bg-green-50';
      if (num <= 6.4) return 'text-amber-600 bg-amber-50';
      return 'text-red-600 bg-red-50';
    }
    return '';
  };

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300';

  return (
    <div className="space-y-5 p-1" dir="rtl">
      <h3 className="font-bold text-purple-700 flex items-center gap-2 text-base">
        🧬 بيانات الغدد الصماء والسكري
      </h3>

      {/* ── Blood Sugar ── */}
      <div className="bg-purple-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-black text-purple-600 uppercase tracking-widest">🩸 قراءات السكري</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">صائم FBS (mg/dL)</label>
            <input type="number" value={data.fbs} onChange={(e) => update('fbs', e.target.value)}
              placeholder="مثال: 90" className={`${inputClass} ${getStatusColor(data.fbs, 'fbs')}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">عشوائي RBS (mg/dL)</label>
            <input type="number" value={data.rbs} onChange={(e) => update('rbs', e.target.value)}
              placeholder="مثال: 140" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">التراكمي HbA1c (%)</label>
            <input type="number" step="0.1" value={data.hba1c} onChange={(e) => update('hba1c', e.target.value)}
              placeholder="مثال: 5.5" className={`${inputClass} ${getStatusColor(data.hba1c, 'hba1c')}`} />
          </div>
        </div>
      </div>

      {/* ── Thyroid & Vitals ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-purple-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-black text-purple-600 uppercase tracking-widest">🦋 الغدة الدرقية</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">TSH (mIU/L)</label>
              <input type="number" step="0.01" value={data.tsh} onChange={(e) => update('tsh', e.target.value)} placeholder="مثال: 2.5" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Free T4 (ng/dL)</label>
              <input type="number" step="0.1" value={data.freeT4} onChange={(e) => update('freeT4', e.target.value)} placeholder="مثال: 1.2" className={inputClass} />
            </div>
          </div>
        </div>
        
        <div className="border border-purple-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-black text-purple-600 uppercase tracking-widest">⚖️ قياسات الجسم</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الوزن (كغم)</label>
              <input type="number" value={data.weight} onChange={(e) => update('weight', e.target.value)} placeholder="80" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الطول (سم)</label>
              <input type="number" value={data.height} onChange={(e) => update('height', e.target.value)} placeholder="170" className={inputClass} />
            </div>
          </div>
          {data.bmi && (
            <div className="bg-purple-50 p-2 rounded-lg text-center border border-purple-100">
              <span className="text-xs text-gray-500">BMI:</span> <span className="font-bold text-purple-800">{data.bmi}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Symptoms ── */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🔍 الأعراض (اختر ما ينطبق)</p>
        <div className="flex flex-wrap gap-2">
          {ENDO_SYMPTOMS.map((symptom) => (
            <button
              key={symptom} type="button" onClick={() => toggleSymptom(symptom)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                data.symptoms.includes(symptom) ? 'bg-purple-500 text-white border-purple-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* ── Diagnosis & Treatment ── */}
      <div className="border-t border-dashed border-purple-200 pt-4 space-y-3">
        <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">💊 التشخيص والعلاج</p>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">التشخيص الطبي</label>
          <textarea value={data.diagnosis} onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="مثال: سكري من النوع الثاني، خمول الغدة الدرقية..." rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">العلاج الموصوف / الجرعات</label>
          <textarea value={data.treatment} onChange={(e) => update('treatment', e.target.value)}
            placeholder="مثال: Metformin 500mg مرتين يومياً، انسولين Lantus 15 وحدة مساءً..." rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات إضافية</label>
          <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)}
            placeholder="توصيات النظام الغذائي، النشاط البدني..." rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const EndocrinologyViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as EndocrinologyData;
  if (!d) return null;

  return (
    <div className="bg-purple-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-purple-800 flex items-center gap-2">🧬 سجل الغدد الصماء والسكري</h4>

      <div className="flex flex-wrap gap-2">
        {d.fbs && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>FBS:</strong> {d.fbs}</span>}
        {d.rbs && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>RBS:</strong> {d.rbs}</span>}
        {d.hba1c && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>التراكمي HbA1c:</strong> {d.hba1c}%</span>}
        {d.tsh && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>TSH:</strong> {d.tsh}</span>}
        {d.freeT4 && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>FT4:</strong> {d.freeT4}</span>}
        {d.weight && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>الوزن:</strong> {d.weight} كغم</span>}
        {d.bmi && <span className="bg-white rounded-lg px-3 py-1 border border-purple-100 text-sm"><strong>BMI:</strong> {d.bmi}</span>}
      </div>

      {d.symptoms?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">الأعراض:</p>
          <div className="flex flex-wrap gap-1">
            {d.symptoms.map((s: string) => (
              <span key={s} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {d.diagnosis && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-purple-100"><strong>🩺 التشخيص:</strong> {d.diagnosis}</p>}
      {d.treatment && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-amber-100"><strong>💊 العلاج والجرعات:</strong> {d.treatment}</p>}
      {d.notes && <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-100"><strong>ملاحظات:</strong> {d.notes}</p>}
    </div>
  );
};

export default EndocrinologyTemplate;
