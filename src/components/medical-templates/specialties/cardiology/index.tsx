import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BloodPressure {
  systolic: string;
  diastolic: string;
}

interface CardiologyData {
  bpRight: BloodPressure;
  bpLeft: BloodPressure;
  pulse: string;
  oxygenSat: string;
  symptoms: string[];
  ecgFindings: string;
  ecgRhythm: string;
  diagnosis: string;
  treatment: string;
  referralNeeded: boolean;
  notes: string;
}

const SYMPTOM_LIST = [
  'ألم في الصدر',
  'ضيق تنفس',
  'خفقان القلب',
  'دوار/إغماء',
  'تعب وإرهاق',
  'تورم الأقدام',
  'ألم في الكتف/الذراع',
  'تعرق بارد',
];

const ECG_RHYTHMS = [
  'إيقاع جيبي طبيعي',
  'رجفان أذيني',
  'تسرع قلبي',
  'بطء قلبي',
  'انقباض قبل الأوان',
  'حصار AV',
  'تغيرات ST-T',
  'موجة Q مرضية',
];

const DEFAULT_BP: BloodPressure = { systolic: '', diastolic: '' };

const DEFAULT_DATA: CardiologyData = {
  bpRight: { ...DEFAULT_BP },
  bpLeft: { ...DEFAULT_BP },
  pulse: '',
  oxygenSat: '',
  symptoms: [],
  ecgFindings: '',
  ecgRhythm: '',
  diagnosis: '',
  treatment: '',
  referralNeeded: false,
  notes: '',
};

// ─── Input Form Component ─────────────────────────────────────────────────────
const CardiologyTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: CardiologyData = { ...DEFAULT_DATA, ...value, symptoms: value?.symptoms || [] };

  const update = (field: keyof CardiologyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const toggleSymptom = (symptom: string) => {
    const current = data.symptoms;
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    update('symptoms', updated);
  };

  const bpClass = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-red-300';

  return (
    <div className="space-y-5 p-1" dir="rtl">
      <h3 className="font-bold text-red-700 flex items-center gap-2 text-base">
        🫀 بيانات طب القلب والشرايين
      </h3>

      {/* ── Blood Pressure & Vitals ── */}
      <div className="bg-red-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-black text-red-600 uppercase tracking-widest">📊 العلامات الحيوية</p>

        {/* BP Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-xl overflow-hidden border border-red-100">
            <thead className="bg-red-100">
              <tr>
                <th className="p-2 text-right text-gray-700 font-semibold">الجانب</th>
                <th className="p-2 text-center text-gray-700 font-semibold">الانقباضي (SYS)</th>
                <th className="p-2 text-center text-gray-700 font-semibold">الانبساطي (DIA)</th>
                <th className="p-2 text-center text-gray-700 font-semibold">التقييم</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {(['bpRight', 'bpLeft'] as const).map((side) => {
                const bp = data[side];
                const sys = parseInt(bp.systolic);
                const dia = parseInt(bp.diastolic);
                const status = !bp.systolic ? '' :
                  sys < 90 ? '⬇️ منخفض' :
                  sys <= 120 && dia <= 80 ? '✅ طبيعي' :
                  sys <= 129 ? '⚠️ مرتفع قليلاً' :
                  sys <= 139 ? '🟠 مرحلة 1' : '🔴 مرحلة 2';
                return (
                  <tr key={side} className="border-t border-red-50">
                    <td className="p-2 font-semibold text-gray-700 bg-red-50/50 whitespace-nowrap">
                      {side === 'bpRight' ? '💪 يمين' : '💪 يسار'}
                    </td>
                    <td className="p-1">
                      <input type="number" value={bp.systolic} onChange={(e) => update(side, { ...bp, systolic: e.target.value })}
                        placeholder="120" className={bpClass} />
                    </td>
                    <td className="p-1">
                      <input type="number" value={bp.diastolic} onChange={(e) => update(side, { ...bp, diastolic: e.target.value })}
                        placeholder="80" className={bpClass} />
                    </td>
                    <td className="p-2 text-center text-xs font-semibold">{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pulse & O2 */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">💓 النبض (bpm)</label>
            <input type="number" value={data.pulse}
              onChange={(e) => update('pulse', e.target.value)}
              placeholder="مثال: 72"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">🩸 تشبع الأكسجين (SpO₂%)</label>
            <input type="number" value={data.oxygenSat}
              onChange={(e) => update('oxygenSat', e.target.value)}
              placeholder="مثال: 98"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        </div>
      </div>

      {/* ── Symptoms ── */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🔍 الأعراض (اختر ما ينطبق)</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_LIST.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => toggleSymptom(symptom)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                data.symptoms.includes(symptom)
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {/* ── ECG ── */}
      <div className="border border-red-100 rounded-xl p-4 space-y-3">
        <p className="text-xs font-black text-red-600 uppercase tracking-widest">⚡ نتيجة رسم القلب (ECG)</p>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">الإيقاع القلبي</label>
          <select
            value={data.ecgRhythm}
            onChange={(e) => update('ecgRhythm', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <option value="">اختر الإيقاع...</option>
            {ECG_RHYTHMS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات ECG التفصيلية</label>
          <textarea
            value={data.ecgFindings}
            onChange={(e) => update('ecgFindings', e.target.value)}
            placeholder="مثال: ارتفاع ST في الإسقاطات V1-V4، موجة T مقلوبة..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>
      </div>

      {/* ── Diagnosis & Treatment ── */}
      <div className="border-t border-dashed border-red-200 pt-4 space-y-3">
        <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">💊 التشخيص والعلاج</p>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">التشخيص الطبي</label>
          <textarea value={data.diagnosis} onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="مثال: ارتفاع ضغط الدم من الدرجة الأولى، القصور التاجي..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">العلاج الموصوف</label>
          <textarea value={data.treatment} onChange={(e) => update('treatment', e.target.value)}
            placeholder="مثال: Amlodipine 5mg مرة يومياً، Aspirin 100mg، تقليل الملح..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>

        {/* Referral */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50">
          <input
            type="checkbox"
            id="cardio-referral"
            checked={data.referralNeeded}
            onChange={(e) => update('referralNeeded', e.target.checked)}
            className="w-4 h-4 accent-red-500"
          />
          <label htmlFor="cardio-referral" className="text-sm font-semibold text-red-700 cursor-pointer">
            🏥 يحتاج إحالة لقسطرة أو مستشفى متخصص
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات إضافية</label>
          <textarea value={data.notes} onChange={(e) => update('notes', e.target.value)}
            placeholder="أي ملاحظات إضافية..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const CardiologyViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as CardiologyData;
  if (!d) return null;

  const renderBP = (label: string, bp: BloodPressure) =>
    bp?.systolic ? (
      <span className="bg-white rounded-lg px-3 py-1 border border-red-100 text-sm">
        <strong>{label}:</strong> {bp.systolic}/{bp.diastolic} mmHg
      </span>
    ) : null;

  return (
    <div className="bg-red-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-red-800 flex items-center gap-2">🫀 بيانات القلب والشرايين</h4>

      {/* Vitals */}
      <div className="flex flex-wrap gap-2">
        {renderBP('يمين', d.bpRight)}
        {renderBP('يسار', d.bpLeft)}
        {d.pulse && <span className="bg-white rounded-lg px-3 py-1 border border-red-100 text-sm"><strong>💓 النبض:</strong> {d.pulse} bpm</span>}
        {d.oxygenSat && <span className="bg-white rounded-lg px-3 py-1 border border-red-100 text-sm"><strong>🩸 SpO₂:</strong> {d.oxygenSat}%</span>}
      </div>

      {/* Symptoms */}
      {d.symptoms?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">الأعراض:</p>
          <div className="flex flex-wrap gap-1">
            {d.symptoms.map((s: string) => (
              <span key={s} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ECG */}
      {(d.ecgRhythm || d.ecgFindings) && (
        <div className="bg-white rounded-lg p-2 border border-red-100 space-y-1">
          {d.ecgRhythm && <p className="text-sm text-gray-700"><strong>⚡ الإيقاع:</strong> {d.ecgRhythm}</p>}
          {d.ecgFindings && <p className="text-sm text-gray-600">{d.ecgFindings}</p>}
        </div>
      )}

      {/* Diagnosis & Treatment */}
      {d.diagnosis && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-red-100"><strong>🩺 التشخيص:</strong> {d.diagnosis}</p>}
      {d.treatment && <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-amber-100"><strong>💊 العلاج:</strong> {d.treatment}</p>}
      {d.referralNeeded && <p className="text-sm font-bold text-red-700 bg-red-100 rounded-lg p-2 border border-red-200">🏥 يحتاج إحالة لقسطرة أو مستشفى متخصص</p>}
      {d.notes && <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-gray-100"><strong>ملاحظات:</strong> {d.notes}</p>}
    </div>
  );
};

export default CardiologyTemplate;
