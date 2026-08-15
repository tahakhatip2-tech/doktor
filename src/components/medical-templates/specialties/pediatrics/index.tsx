import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VaccineRecord {
  name: string;
  given: boolean;
  date: string;
}

interface PediatricsData {
  weight: string;
  height: string;
  headCircumference: string;
  bmi: string;
  temperature: string;
  pulse: string;
  respiratoryRate: string;
  oxygenSat: string;
  // Growth status
  weightStatus: string;
  // Development milestones for current visit
  developmentNotes: string;
  // Vaccines
  vaccines: VaccineRecord[];
  // Chief complaint
  chiefComplaint: string;
  // Examination findings
  examinationFindings: string;
  diagnosis: string;
  treatment: string;
  nextVisitWeeks: string;
  notes: string;
}

const COMMON_VACCINES = [
  'BCG (السل)',
  'Hep B (التهاب الكبد B)',
  'DTP (دفتيريا، كزاز، سعال ديكي)',
  'Hib (النزلة الإنفلونزية B)',
  'OPV/IPV (شلل الأطفال)',
  'PCV (الرئوية)',
  'RV (الروتا)',
  'MMR (حصبة، نكاف، حصبة ألمانية)',
  'Varicella (جدري الماء)',
  'Hep A (التهاب الكبد A)',
  'Influenza (إنفلونزا)',
  'Meningococcal (حمى الدماغ)',
];

const DEFAULT_DATA: PediatricsData = {
  weight: '',
  height: '',
  headCircumference: '',
  bmi: '',
  temperature: '',
  pulse: '',
  respiratoryRate: '',
  oxygenSat: '',
  weightStatus: '',
  developmentNotes: '',
  vaccines: COMMON_VACCINES.map((name) => ({ name, given: false, date: '' })),
  chiefComplaint: '',
  examinationFindings: '',
  diagnosis: '',
  treatment: '',
  nextVisitWeeks: '',
  notes: '',
};

// ─── BMI Calculator ───────────────────────────────────────────────────────────
function calcBMI(weight: string, height: string): string {
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return '';
  return (w / (h * h)).toFixed(1);
}

function bmiStatus(bmi: string): { label: string; color: string } {
  const b = parseFloat(bmi);
  if (!b) return { label: '', color: '' };
  if (b < 14) return { label: '⬇️ نقص وزن حاد', color: 'text-blue-700' };
  if (b < 18.5) return { label: '⬇️ نقص وزن', color: 'text-blue-600' };
  if (b < 25) return { label: '✅ وزن طبيعي', color: 'text-green-600' };
  if (b < 30) return { label: '⚠️ زيادة وزن', color: 'text-amber-600' };
  return { label: '🔴 سمنة', color: 'text-red-600' };
}

// ─── Input Form Component ─────────────────────────────────────────────────────
const PediatricsTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: PediatricsData = {
    ...DEFAULT_DATA,
    ...value,
    vaccines: value?.vaccines?.length ? value.vaccines : DEFAULT_DATA.vaccines,
  };

  const update = (field: keyof PediatricsData, val: any) => {
    const updated = { ...data, [field]: val };
    // Auto-calc BMI
    if (field === 'weight' || field === 'height') {
      updated.bmi = calcBMI(
        field === 'weight' ? val : data.weight,
        field === 'height' ? val : data.height
      );
    }
    onChange(updated);
  };

  const toggleVaccine = (index: number, given: boolean) => {
    const vaccines = [...data.vaccines];
    vaccines[index] = { ...vaccines[index], given };
    update('vaccines', vaccines);
  };

  const setVaccineDate = (index: number, date: string) => {
    const vaccines = [...data.vaccines];
    vaccines[index] = { ...vaccines[index], date };
    update('vaccines', vaccines);
  };

  const bmi = data.bmi || calcBMI(data.weight, data.height);
  const { label: bmiLabel, color: bmiColor } = bmiStatus(bmi);

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300';

  return (
    <div className="space-y-5 p-1" dir="rtl">
      <h3 className="font-bold text-green-700 flex items-center gap-2 text-base">
        🧒 بيانات طب الأطفال
      </h3>

      {/* ── Vitals & Growth ── */}
      <div className="bg-green-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-black text-green-600 uppercase tracking-widest">📏 القياسات الجسدية والعلامات الحيوية</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">⚖️ الوزن (كغم)</label>
            <input type="number" step="0.1" value={data.weight}
              onChange={(e) => update('weight', e.target.value)}
              placeholder="مثال: 15.5"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">📏 الطول (سم)</label>
            <input type="number" step="0.5" value={data.height}
              onChange={(e) => update('height', e.target.value)}
              placeholder="مثال: 90"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">🧠 محيط الرأس (سم)</label>
            <input type="number" step="0.5" value={data.headCircumference}
              onChange={(e) => update('headCircumference', e.target.value)}
              placeholder="مثال: 48"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">🌡️ الحرارة (°C)</label>
            <input type="number" step="0.1" value={data.temperature}
              onChange={(e) => update('temperature', e.target.value)}
              placeholder="مثال: 37.2"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">💓 النبض (bpm)</label>
            <input type="number" value={data.pulse}
              onChange={(e) => update('pulse', e.target.value)}
              placeholder="مثال: 100"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">🩸 SpO₂ (%)</label>
            <input type="number" value={data.oxygenSat}
              onChange={(e) => update('oxygenSat', e.target.value)}
              placeholder="مثال: 98"
              className={inputClass}
            />
          </div>
        </div>

        {/* BMI Result */}
        {bmi && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-semibold">BMI</p>
              <p className="text-2xl font-black text-gray-800">{bmi}</p>
            </div>
            <div>
              <p className={`font-bold text-sm ${bmiColor}`}>{bmiLabel}</p>
              <p className="text-xs text-gray-400">مؤشر كتلة الجسم</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Chief Complaint ── */}
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🤒 شكوى الزيارة الرئيسية</label>
        <textarea
          value={data.chiefComplaint}
          onChange={(e) => update('chiefComplaint', e.target.value)}
          placeholder="مثال: حمى منذ يومين، سعال، رفض الرضاعة..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />
      </div>

      {/* ── Examination ── */}
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🔍 نتائج الفحص السريري</label>
        <textarea
          value={data.examinationFindings}
          onChange={(e) => update('examinationFindings', e.target.value)}
          placeholder="مثال: الرئتين صافيتان، البطن لين، الحلق أحمر بدون إفراز، الأذنان طبيعيتان..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />
      </div>

      {/* ── Vaccines ── */}
      <div className="border border-green-100 rounded-xl p-4">
        <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-3">💉 اللقاحات المعطاة في هذه الزيارة</p>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {data.vaccines.map((vaccine, idx) => (
            <div key={vaccine.name} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${vaccine.given ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
              <input
                type="checkbox"
                checked={vaccine.given}
                onChange={(e) => toggleVaccine(idx, e.target.checked)}
                className="w-4 h-4 accent-green-500 flex-shrink-0"
              />
              <span className={`text-xs font-semibold flex-1 ${vaccine.given ? 'text-green-700' : 'text-gray-500'}`}>
                {vaccine.name}
              </span>
              {vaccine.given && (
                <input
                  type="date"
                  value={vaccine.date}
                  onChange={(e) => setVaccineDate(idx, e.target.value)}
                  className="border border-green-200 rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-300 bg-white w-32"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Development Notes ── */}
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">🌱 ملاحظات النمو والتطور</label>
        <textarea
          value={data.developmentNotes}
          onChange={(e) => update('developmentNotes', e.target.value)}
          placeholder="مثال: يمشي بشكل طبيعي، يتكلم كلمتين، يتفاعل جيداً، جلوسه مستقر..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
        />
      </div>

      {/* ── Diagnosis & Treatment ── */}
      <div className="border-t border-dashed border-green-200 pt-4 space-y-3">
        <p className="text-xs font-black text-green-600 uppercase tracking-widest">💊 التشخيص والعلاج</p>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">التشخيص الطبي</label>
          <textarea value={data.diagnosis}
            onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="مثال: التهاب اللوزتين البكتيري، نزلة برد فيروسية، حمى بدون مصدر..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">العلاج الموصوف</label>
          <textarea value={data.treatment}
            onChange={(e) => update('treatment', e.target.value)}
            placeholder="مثال: Amoxicillin شراب 250mg/5ml — 5ml ثلاث مرات يومياً لمدة 7 أيام، Paracetamol عند الحاجة..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">📅 موعد الزيارة القادمة (بعد كم أسبوع؟)</label>
          <input type="text" value={data.nextVisitWeeks}
            onChange={(e) => update('nextVisitWeeks', e.target.value)}
            placeholder="مثال: أسبوع واحد، شهر، 3 أشهر..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات إضافية</label>
          <textarea value={data.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="توجيهات للأهل، علامات خطر يجب التنبه لها..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const PediatricsViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as PediatricsData;
  if (!d) return null;
  const givenVaccines = d.vaccines?.filter((v: VaccineRecord) => v.given) || [];

  return (
    <div className="bg-green-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-green-800 flex items-center gap-2">🧒 سجل طب الأطفال</h4>

      {/* Vitals */}
      <div className="flex flex-wrap gap-2">
        {d.weight && <span className="bg-white rounded-lg px-3 py-1 border border-green-100 text-sm"><strong>⚖️ الوزن:</strong> {d.weight} كغم</span>}
        {d.height && <span className="bg-white rounded-lg px-3 py-1 border border-green-100 text-sm"><strong>📏 الطول:</strong> {d.height} سم</span>}
        {d.headCircumference && <span className="bg-white rounded-lg px-3 py-1 border border-green-100 text-sm"><strong>🧠 محيط الرأس:</strong> {d.headCircumference} سم</span>}
        {d.temperature && <span className="bg-white rounded-lg px-3 py-1 border border-green-100 text-sm"><strong>🌡️ الحرارة:</strong> {d.temperature}°C</span>}
        {d.pulse && <span className="bg-white rounded-lg px-3 py-1 border border-green-100 text-sm"><strong>💓 النبض:</strong> {d.pulse} bpm</span>}
        {d.oxygenSat && <span className="bg-white rounded-lg px-3 py-1 border border-green-100 text-sm"><strong>🩸 SpO₂:</strong> {d.oxygenSat}%</span>}
        {d.bmi && (
          <span className={`rounded-lg px-3 py-1 text-sm font-bold border ${bmiStatus(d.bmi).color} bg-white border-green-100`}>
            BMI: {d.bmi} — {bmiStatus(d.bmi).label}
          </span>
        )}
      </div>

      {d.chiefComplaint && <p className="text-sm bg-white rounded-lg p-2 border border-green-100"><strong>🤒 الشكوى:</strong> {d.chiefComplaint}</p>}
      {d.examinationFindings && <p className="text-sm bg-white rounded-lg p-2 border border-green-100"><strong>🔍 الفحص:</strong> {d.examinationFindings}</p>}

      {/* Vaccines */}
      {givenVaccines.length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <p className="text-xs font-bold text-green-700 mb-2">💉 اللقاحات المعطاة:</p>
          <div className="flex flex-wrap gap-1">
            {givenVaccines.map((v: VaccineRecord) => (
              <span key={v.name} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {v.name}{v.date ? ` (${v.date})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {d.developmentNotes && <p className="text-sm bg-white rounded-lg p-2 border border-green-100"><strong>🌱 التطور:</strong> {d.developmentNotes}</p>}
      {d.diagnosis && <p className="text-sm bg-white rounded-lg p-2 border border-green-100"><strong>🩺 التشخيص:</strong> {d.diagnosis}</p>}
      {d.treatment && <p className="text-sm bg-white rounded-lg p-2 border border-amber-100"><strong>💊 العلاج:</strong> {d.treatment}</p>}
      {d.nextVisitWeeks && <p className="text-sm bg-white rounded-lg p-2 border border-green-100"><strong>📅 الزيارة القادمة:</strong> {d.nextVisitWeeks}</p>}
      {d.notes && <p className="text-sm bg-white rounded-lg p-2 border border-gray-100"><strong>ملاحظات:</strong> {d.notes}</p>}
    </div>
  );
};

export default PediatricsTemplate;
