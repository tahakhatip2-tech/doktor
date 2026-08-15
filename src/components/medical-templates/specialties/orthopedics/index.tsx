import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrthopedicsData {
  affectedArea: string;
  painLevel: string; // 1-10
  injuryType: string;
  symptoms: string[];
  xrayFindings: string;
  surgeryRecommended: boolean;
  physicalTherapyNeeded: boolean;
  diagnosis: string;
  treatment: string;
  notes: string;
}

const ORTHO_AREAS = [
  'الكتف',
  'المرفق',
  'الرسغ / اليد',
  'العمود الفقري (عنقي)',
  'العمود الفقري (قطني)',
  'الحوض',
  'الورك',
  'الركبة',
  'الكاحل / القدم',
];

const ORTHO_SYMPTOMS = [
  'ألم حاد',
  'ألم مزمن',
  'تورم',
  'تصلب / تيبس',
  'ضعف في العضلات',
  'خدر / تنميل',
  'صوت طقطقة',
  'عدم استقرار المفصل',
];

const DEFAULT_DATA: OrthopedicsData = {
  affectedArea: '',
  painLevel: '5',
  injuryType: '',
  symptoms: [],
  xrayFindings: '',
  surgeryRecommended: false,
  physicalTherapyNeeded: false,
  diagnosis: '',
  treatment: '',
  notes: '',
};

// ─── Input Form Component ─────────────────────────────────────────────────────
const OrthopedicsTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: OrthopedicsData = { ...DEFAULT_DATA, ...value, symptoms: value?.symptoms || [] };

  const update = (field: keyof OrthopedicsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const toggleSymptom = (symptom: string) => {
    const current = data.symptoms;
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    update('symptoms', updated);
  };

  return (
    <div className="space-y-5 p-1" dir="rtl">
      <h3 className="font-bold text-amber-700 flex items-center gap-2 text-base">
        🦴 بيانات جراحة العظام والمفاصل
      </h3>

      {/* ── Assessment ── */}
      <div className="bg-amber-50 rounded-xl p-4 space-y-4">
        <p className="text-xs font-black text-amber-600 uppercase tracking-widest">📝 التقييم السريري</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">المنطقة المصابة</label>
            <select
              value={data.affectedArea}
              onChange={(e) => update('affectedArea', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
            >
              <option value="">اختر المنطقة...</option>
              {ORTHO_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">نوع الإصابة / الشكوى</label>
            <select
              value={data.injuryType}
              onChange={(e) => update('injuryType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
            >
              <option value="">اختر النوع...</option>
              <option value="كسر (Fracture)">كسر (Fracture)</option>
              <option value="تمزق أربطة (Sprain/Tear)">تمزق أربطة / أوتار</option>
              <option value="خلع (Dislocation)">خلع (Dislocation)</option>
              <option value="خشونة مفاصل (Osteoarthritis)">خشونة مفاصل</option>
              <option value="انزلاق غضروفي (Disc)">انزلاق غضروفي</option>
              <option value="التهاب (Inflammation)">التهاب / روميتزم</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
        </div>

        {/* Pain Scale */}
        <div>
          <label className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
            <span>مقياس الألم (1-10)</span>
            <span className="font-bold text-amber-700">{data.painLevel} / 10</span>
          </label>
          <input
            type="range" min="0" max="10" step="1"
            value={data.painLevel}
            onChange={(e) => update('painLevel', e.target.value)}
            className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
            <span>بدون ألم (0)</span>
            <span>ألم متوسط (5)</span>
            <span>ألم شديد جداً (10)</span>
          </div>
        </div>
      </div>

      {/* ── Symptoms ── */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🔍 الأعراض المرافقة</p>
        <div className="flex flex-wrap gap-2">
          {ORTHO_SYMPTOMS.map((symptom) => (
            <button
              key={symptom} type="button" onClick={() => toggleSymptom(symptom)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                data.symptoms.includes(symptom) ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* ── Imaging ── */}
      <div className="border border-amber-100 rounded-xl p-4 space-y-3">
        <p className="text-xs font-black text-amber-600 uppercase tracking-widest">🩻 صور الأشعة / الرنين</p>
        <div>
          <textarea value={data.xrayFindings} onChange={(e) => update('xrayFindings', e.target.value)}
            placeholder="نتائج صور الأشعة السينية (X-Ray)، الرنين (MRI)، أو المقطعية (CT)..." rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
          />
        </div>
      </div>

      {/* ── Diagnosis & Treatment ── */}
      <div className="border-t border-dashed border-amber-200 pt-4 space-y-3">
        <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">💊 التشخيص والعلاج</p>
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">التشخيص النهائي</label>
          <textarea value={data.diagnosis} onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="مثال: قطع في الرباط الصليبي الأمامي للركبة اليمنى..." rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">العطة العلاجية / الأدوية</label>
          <textarea value={data.treatment} onChange={(e) => update('treatment', e.target.value)}
            placeholder="الأدوية، الجبائر، التعليمات..." rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
          />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/50">
            <input type="checkbox" id="surgery" checked={data.surgeryRecommended}
              onChange={(e) => update('surgeryRecommended', e.target.checked)}
              className="w-4 h-4 accent-amber-600" />
            <label htmlFor="surgery" className="text-sm font-semibold text-amber-800 cursor-pointer">
              🔪 يحتاج تدخل جراحي
            </label>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/50">
            <input type="checkbox" id="physio" checked={data.physicalTherapyNeeded}
              onChange={(e) => update('physicalTherapyNeeded', e.target.checked)}
              className="w-4 h-4 accent-amber-600" />
            <label htmlFor="physio" className="text-sm font-semibold text-amber-800 cursor-pointer">
              🏃 يحتاج علاج طبيعي
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const OrthopedicsViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as OrthopedicsData;
  if (!d) return null;

  return (
    <div className="bg-amber-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-amber-800 flex items-center gap-2">🦴 سجل العظام والمفاصل</h4>

      <div className="flex flex-wrap gap-2">
        {d.affectedArea && <span className="bg-white rounded-lg px-3 py-1 border border-amber-100 text-sm"><strong>المنطقة:</strong> {d.affectedArea}</span>}
        {d.injuryType && <span className="bg-white rounded-lg px-3 py-1 border border-amber-100 text-sm"><strong>النوع:</strong> {d.injuryType}</span>}
        {d.painLevel && (
          <span className={`rounded-lg px-3 py-1 text-sm font-bold border border-amber-200 ${parseInt(d.painLevel) > 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
            مقياس الألم: {d.painLevel}/10
          </span>
        )}
      </div>

      {d.symptoms?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">الأعراض:</p>
          <div className="flex flex-wrap gap-1">
            {d.symptoms.map((s: string) => (
              <span key={s} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {d.xrayFindings && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-amber-100"><strong>🩻 الأشعة:</strong> {d.xrayFindings}</p>}
      
      {d.diagnosis && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-amber-100"><strong>🩺 التشخيص:</strong> {d.diagnosis}</p>}
      {d.treatment && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-amber-200"><strong>💊 العلاج:</strong> {d.treatment}</p>}
      
      {(d.surgeryRecommended || d.physicalTherapyNeeded) && (
        <div className="flex gap-2">
          {d.surgeryRecommended && <span className="text-sm font-bold text-white bg-red-500 rounded-lg px-3 py-1.5 shadow-sm">🔪 قرار جراحة</span>}
          {d.physicalTherapyNeeded && <span className="text-sm font-bold text-amber-800 bg-amber-200 rounded-lg px-3 py-1.5 border border-amber-300">🏃 تحويل للعلاج الطبيعي</span>}
        </div>
      )}
    </div>
  );
};

export default OrthopedicsTemplate;
