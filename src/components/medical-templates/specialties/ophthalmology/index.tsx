import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EyeData {
  sphere: string;
  cylinder: string;
  axis: string;
  add: string;
}

interface OphthalmologyData {
  rightEye: EyeData;
  leftEye: EyeData;
  pd: string; // Pupillary Distance
  nearVision: string;
  farVision: string;
  notes: string;
  diagnosis: string;   // التشخيص الطبي
  treatment: string;   // العلاج (قطرات، أدوية...)
}

const DEFAULT_EYE: EyeData = { sphere: '', cylinder: '', axis: '', add: '' };

const DEFAULT_DATA: OphthalmologyData = {
  rightEye: { ...DEFAULT_EYE },
  leftEye: { ...DEFAULT_EYE },
  pd: '',
  nearVision: '',
  farVision: '',
  notes: '',
  diagnosis: '',
  treatment: '',
};

// ─── Input Form Component ─────────────────────────────────────────────────────
const OphthalmologyTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: OphthalmologyData = { ...DEFAULT_DATA, ...value };

  const updateEye = (side: 'rightEye' | 'leftEye', field: keyof EyeData, val: string) => {
    onChange({ ...data, [side]: { ...data[side], [field]: val } });
  };

  const updateField = (field: keyof OphthalmologyData, val: string) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 p-1" dir="rtl">
      <h3 className="font-bold text-blue-700 flex items-center gap-2 text-base">
        👁️ فحص النظر — وصفة النظارة
      </h3>

      {/* Eye Chart Table */}
      <div className="overflow-x-auto rounded-xl border border-blue-100">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-2 text-right text-gray-600 font-semibold">العين</th>
              <th className="p-2 text-center text-gray-600 font-semibold">Sphere</th>
              <th className="p-2 text-center text-gray-600 font-semibold">Cylinder</th>
              <th className="p-2 text-center text-gray-600 font-semibold">Axis</th>
              <th className="p-2 text-center text-gray-600 font-semibold">Add</th>
            </tr>
          </thead>
          <tbody>
            {(['rightEye', 'leftEye'] as const).map((side) => (
              <tr key={side} className="border-t border-blue-100">
                <td className="p-2 font-semibold text-gray-700 bg-blue-50/50 whitespace-nowrap">
                  {side === 'rightEye' ? '👁 يمين (R)' : '👁 يسار (L)'}
                </td>
                {(['sphere', 'cylinder', 'axis', 'add'] as const).map((field) => (
                  <td key={field} className="p-1">
                    <input
                      type="text"
                      value={data[side][field]}
                      onChange={(e) => updateEye(side, field, e.target.value)}
                      placeholder={field === 'axis' ? '0-180' : field === 'add' ? '+1.00' : '±0.00'}
                      className="w-full text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PD and Vision */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">PD (المسافة البؤبؤية)</label>
          <input
            type="text"
            value={data.pd}
            onChange={(e) => updateField('pd', e.target.value)}
            placeholder="مثال: 64"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">حدة البصر عن قُرب</label>
          <input
            type="text"
            value={data.nearVision}
            onChange={(e) => updateField('nearVision', e.target.value)}
            placeholder="مثال: 6/6"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">حدة البصر عن بُعد</label>
          <input
            type="text"
            value={data.farVision}
            onChange={(e) => updateField('farVision', e.target.value)}
            placeholder="مثال: 6/9"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات العيون</label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="مثال: ضغط العين طبيعي، شبكية سليمة..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>

      {/* Separator */}
      <div className="border-t border-dashed border-blue-200 pt-4">
        <h3 className="font-bold text-blue-700 flex items-center gap-2 text-sm mb-3">
          💊 التشخيص والعلاج الموصوف
        </h3>

        {/* Diagnosis */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">التشخيص الطبي</label>
          <textarea
            value={data.diagnosis}
            onChange={(e) => updateField('diagnosis', e.target.value)}
            placeholder="مثال: قِصَر نظر، مياه بيضاء مبكرة، التهاب ملتحمة..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Treatment */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">العلاج الموصوف (أدوية، قطرات...)</label>
          <textarea
            value={data.treatment}
            onChange={(e) => updateField('treatment', e.target.value)}
            placeholder="مثال: قطرة Tobramycin مرتين يومياً لمدة أسبوع، دموع صناعية عند الحاجة..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Viewer Component (for patient records) ───────────────────────────────────
export const OphthalmologyViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as OphthalmologyData;
  if (!d) return null;

  const renderEyeRow = (label: string, eye: EyeData) => (
    <tr className="border-t border-gray-100">
      <td className="py-2 px-3 font-medium text-gray-700 bg-gray-50">{label}</td>
      <td className="py-2 px-3 text-center">{eye.sphere || '—'}</td>
      <td className="py-2 px-3 text-center">{eye.cylinder || '—'}</td>
      <td className="py-2 px-3 text-center">{eye.axis || '—'}</td>
      <td className="py-2 px-3 text-center">{eye.add || '—'}</td>
    </tr>
  );

  return (
    <div className="bg-blue-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-blue-800 flex items-center gap-2">
        👁️ وصفة النظارة
      </h4>
      <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 text-right text-gray-700">العين</th>
              <th className="p-2 text-center text-gray-700">Sphere</th>
              <th className="p-2 text-center text-gray-700">Cylinder</th>
              <th className="p-2 text-center text-gray-700">Axis</th>
              <th className="p-2 text-center text-gray-700">Add</th>
            </tr>
          </thead>
          <tbody>
            {renderEyeRow('👁 يمين (R)', d.rightEye || {} as EyeData)}
            {renderEyeRow('👁 يسار (L)', d.leftEye || {} as EyeData)}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 text-sm text-gray-700 flex-wrap">
        {d.pd && <span className="bg-white rounded-lg px-3 py-1 border border-blue-100"><strong>PD:</strong> {d.pd}</span>}
        {d.nearVision && <span className="bg-white rounded-lg px-3 py-1 border border-blue-100"><strong>قريب:</strong> {d.nearVision}</span>}
        {d.farVision && <span className="bg-white rounded-lg px-3 py-1 border border-blue-100"><strong>بعيد:</strong> {d.farVision}</span>}
      </div>
      {d.notes && <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-blue-100"><strong>ملاحظات:</strong> {d.notes}</p>}
      {(d.diagnosis || d.treatment) && (
        <div className="border-t border-blue-200 pt-3 space-y-2">
          {d.diagnosis && (
            <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-blue-100">
              <strong>🩺 التشخيص:</strong> {d.diagnosis}
            </p>
          )}
          {d.treatment && (
            <p className="text-sm text-gray-700 bg-white rounded-lg p-2 border border-amber-100">
              <strong>💊 العلاج الموصوف:</strong> {d.treatment}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OphthalmologyTemplate;
