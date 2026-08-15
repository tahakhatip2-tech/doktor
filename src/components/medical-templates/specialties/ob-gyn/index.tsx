import React, { useMemo } from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface VisitRecord {
  week: number;
  date: string;
  notes: string;
  weight: string;
  bp: string; // Blood pressure
  fetalHR: string; // Fetal heart rate
}

interface ObGynData {
  lmp: string; // Last Menstrual Period date
  gravida: string; // عدد الحمل
  para: string;    // عدد الولادات
  abortus: string; // الإجهاض
  visits: VisitRecord[];
  riskFactors: string;
  notes: string;
}

const DEFAULT_DATA: ObGynData = {
  lmp: '',
  gravida: '',
  para: '',
  abortus: '',
  visits: [],
  riskFactors: '',
  notes: '',
};

// ─── Pregnancy Calculator ─────────────────────────────────────────────────────
function calculatePregnancy(lmp: string) {
  if (!lmp) return null;

  const lmpDate = new Date(lmp);
  const today = new Date();
  const diffMs = today.getTime() - lmpDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays > 300) return null;

  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  // EDD: LMP + 280 days (Naegele's Rule)
  const edd = new Date(lmpDate);
  edd.setDate(edd.getDate() + 280);

  const trimester = weeks < 13 ? 'الأول' : weeks < 27 ? 'الثاني' : 'الثالث';

  // Recommended visit weeks
  const visitSchedule = [8, 12, 16, 20, 24, 28, 32, 36, 38, 40];

  return {
    weeks,
    days,
    edd: edd.toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' }),
    eddIso: edd.toISOString().split('T')[0],
    trimester,
    visitSchedule,
  };
}

// ─── Input Form Component ─────────────────────────────────────────────────────
const ObGynTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: ObGynData = { ...DEFAULT_DATA, ...value };

  const pregnancy = useMemo(() => calculatePregnancy(data.lmp), [data.lmp]);

  const updateField = <K extends keyof ObGynData>(field: K, val: ObGynData[K]) => {
    onChange({ ...data, [field]: val });
  };

  const addVisit = () => {
    const newVisit: VisitRecord = {
      week: pregnancy?.weeks || 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      weight: '',
      bp: '',
      fetalHR: '',
    };
    updateField('visits', [...(data.visits || []), newVisit]);
  };

  const updateVisit = (index: number, field: keyof VisitRecord, val: string) => {
    const updated = [...(data.visits || [])];
    updated[index] = { ...updated[index], [field]: val };
    updateField('visits', updated);
  };

  const removeVisit = (index: number) => {
    const updated = [...(data.visits || [])];
    updated.splice(index, 1);
    updateField('visits', updated);
  };

  return (
    <div className="space-y-4 p-1" dir="rtl">
      <h3 className="font-bold text-pink-700 flex items-center gap-2 text-base">
        🤰 متابعة الحمل — النسائية والتوليد
      </h3>

      {/* LMP & Obstetric History */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ آخر دورة (LMP)</label>
          <input
            type="date"
            value={data.lmp}
            onChange={(e) => updateField('lmp', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['gravida', 'para', 'abortus'] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-center capitalize">{field}</label>
              <input
                type="number"
                min="0"
                value={data[field]}
                onChange={(e) => updateField(field, e.target.value)}
                className="w-full text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pregnancy Calculator Result */}
      {pregnancy && (
        <div className="bg-gradient-to-l from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="text-center">
              <p className="text-xs text-gray-500">عمر الحمل</p>
              <p className="font-bold text-pink-700 text-lg">
                {pregnancy.weeks} أسابيع {pregnancy.days > 0 ? `+ ${pregnancy.days} أيام` : ''}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">الثلث</p>
              <p className="font-bold text-purple-700">{pregnancy.trimester}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">موعد الولادة المتوقع (EDD)</p>
              <p className="font-bold text-indigo-700">{pregnancy.edd}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>أسبوع 0</span>
              <span>أسبوع 40</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((pregnancy.weeks / 40) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-1">
              {Math.round((pregnancy.weeks / 40) * 100)}% من مدة الحمل
            </p>
          </div>
        </div>
      )}

      {/* Visit Records */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">سجل الزيارات الدورية</label>
          <button
            onClick={addVisit}
            className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-lg hover:bg-pink-200 transition-colors font-medium"
          >
            + إضافة زيارة
          </button>
        </div>

        {(data.visits || []).length > 0 && (
          <div className="space-y-2">
            {data.visits.map((visit, i) => (
              <div key={i} className="bg-white border border-pink-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-600">زيارة أسبوع {visit.week}</span>
                  <button onClick={() => removeVisit(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { field: 'week', label: 'الأسبوع', placeholder: '20' },
                    { field: 'date', label: 'التاريخ', placeholder: '', type: 'date' },
                    { field: 'weight', label: 'الوزن (كغ)', placeholder: '65' },
                    { field: 'bp', label: 'ضغط الدم', placeholder: '120/80' },
                  ].map(({ field, label, placeholder, type }) => (
                    <div key={field}>
                      <label className="block text-[10px] text-gray-500 mb-0.5">{label}</label>
                      <input
                        type={type || 'text'}
                        value={(visit as any)[field]}
                        onChange={(e) => updateVisit(i, field as keyof VisitRecord, e.target.value)}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">نبض الجنين (bpm)</label>
                    <input
                      type="text"
                      value={visit.fetalHR}
                      onChange={(e) => updateVisit(i, 'fetalHR', e.target.value)}
                      placeholder="140"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">ملاحظات</label>
                    <input
                      type="text"
                      value={visit.notes}
                      onChange={(e) => updateVisit(i, 'notes', e.target.value)}
                      placeholder="..."
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Factors & Notes */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">عوامل الخطر</label>
          <input
            type="text"
            value={data.riskFactors}
            onChange={(e) => updateField('riskFactors', e.target.value)}
            placeholder="مثال: سكري حمل، ضغط دم..."
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات</label>
          <textarea
            value={data.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const ObGynViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as ObGynData;
  if (!d) return null;

  const pregnancy = calculatePregnancy(d.lmp);

  return (
    <div className="bg-pink-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-pink-800 flex items-center gap-2">🤰 متابعة الحمل</h4>

      <div className="flex flex-wrap gap-3">
        {d.lmp && (
          <span className="bg-white border border-pink-200 rounded-lg px-3 py-1 text-sm">
            <strong>آخر دورة:</strong> {new Date(d.lmp).toLocaleDateString('ar-JO')}
          </span>
        )}
        {pregnancy && (
          <>
            <span className="bg-white border border-pink-200 rounded-lg px-3 py-1 text-sm">
              <strong>عمر الحمل:</strong> {pregnancy.weeks} أسبوع + {pregnancy.days} أيام
            </span>
            <span className="bg-white border border-pink-200 rounded-lg px-3 py-1 text-sm">
              <strong>EDD:</strong> {pregnancy.edd}
            </span>
          </>
        )}
        {d.gravida && <span className="bg-white border border-pink-200 rounded-lg px-3 py-1 text-sm"><strong>G:</strong>{d.gravida} <strong>P:</strong>{d.para} <strong>A:</strong>{d.abortus}</span>}
      </div>

      {d.visits && d.visits.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">سجل الزيارات ({d.visits.length})</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs bg-white rounded-lg border border-pink-100">
              <thead className="bg-pink-100">
                <tr>
                  <th className="p-1.5 text-right">الأسبوع</th>
                  <th className="p-1.5 text-center">التاريخ</th>
                  <th className="p-1.5 text-center">الوزن</th>
                  <th className="p-1.5 text-center">الضغط</th>
                  <th className="p-1.5 text-center">نبض الجنين</th>
                </tr>
              </thead>
              <tbody>
                {d.visits.map((v, i) => (
                  <tr key={i} className="border-t border-pink-50">
                    <td className="p-1.5 font-medium">{v.week}</td>
                    <td className="p-1.5 text-center">{v.date}</td>
                    <td className="p-1.5 text-center">{v.weight || '—'}</td>
                    <td className="p-1.5 text-center">{v.bp || '—'}</td>
                    <td className="p-1.5 text-center">{v.fetalHR || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {d.riskFactors && (
        <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-pink-100">
          <strong>عوامل الخطر:</strong> {d.riskFactors}
        </p>
      )}
    </div>
  );
};

export default ObGynTemplate;
