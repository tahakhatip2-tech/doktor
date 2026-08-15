import React from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LabTest {
  name: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | '';
}

interface LaboratoriesData {
  sampleType: string;
  collectionDate: string;
  tests: LabTest[];
  notes: string;
}

const DEFAULT_DATA: LaboratoriesData = {
  sampleType: 'دم (Blood)',
  collectionDate: new Date().toISOString().split('T')[0],
  tests: [],
  notes: '',
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  normal: { label: 'طبيعي', color: 'text-green-600', bg: 'bg-green-50' },
  high: { label: 'مرتفع', color: 'text-red-600', bg: 'bg-red-50' },
  low: { label: 'منخفض', color: 'text-blue-600', bg: 'bg-blue-50' },
  '': { label: 'غير محدد', color: 'text-gray-600', bg: 'bg-gray-50' },
};

const SAMPLE_TYPES = ['دم (Blood)', 'بول (Urine)', 'براز (Stool)', 'مسحة (Swab)', 'أخرى'];

// ─── Input Form Component ─────────────────────────────────────────────────────
const LaboratoriesTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: LaboratoriesData = { ...DEFAULT_DATA, ...value };

  const updateField = <K extends keyof LaboratoriesData>(field: K, val: LaboratoriesData[K]) => {
    onChange({ ...data, [field]: val });
  };

  const addTest = () => {
    updateField('tests', [
      ...(data.tests || []),
      { name: '', result: '', unit: '', referenceRange: '', status: '' },
    ]);
  };

  const updateTest = (index: number, field: keyof LabTest, val: string) => {
    const updated = [...(data.tests || [])];
    updated[index] = { ...updated[index], [field]: val };
    updateField('tests', updated);
  };

  const removeTest = (index: number) => {
    const updated = [...(data.tests || [])];
    updated.splice(index, 1);
    updateField('tests', updated);
  };

  return (
    <div className="space-y-4 p-1" dir="rtl">
      <h3 className="font-bold text-violet-700 flex items-center gap-2 text-base">
        🔬 نتائج المختبرات والتحاليل
      </h3>

      {/* General Info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">نوع العينة</label>
          <select
            value={data.sampleType}
            onChange={(e) => updateField('sampleType', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {SAMPLE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ سحب العينة</label>
          <input
            type="date"
            value={data.collectionDate}
            onChange={(e) => updateField('collectionDate', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>

      {/* Tests Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">قائمة التحاليل المنجزة</label>
          <button
            type="button"
            onClick={addTest}
            className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-lg hover:bg-violet-200 transition-colors font-medium"
          >
            + إضافة فحص
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-violet-100">
          <table className="w-full text-sm">
            <thead className="bg-violet-50">
              <tr>
                <th className="p-2 text-right text-gray-600 font-semibold min-w-[150px]">اسم الفحص (Test)</th>
                <th className="p-2 text-center text-gray-600 font-semibold min-w-[100px]">النتيجة (Result)</th>
                <th className="p-2 text-center text-gray-600 font-semibold min-w-[80px]">الوحدة (Unit)</th>
                <th className="p-2 text-center text-gray-600 font-semibold min-w-[120px]">المعدل الطبيعي (Range)</th>
                <th className="p-2 text-center text-gray-600 font-semibold min-w-[100px]">الحالة (Status)</th>
                <th className="p-2 text-center text-gray-600 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {(data.tests || []).map((test, index) => (
                <tr key={index} className="border-t border-violet-100 bg-white">
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={test.name}
                      onChange={(e) => updateTest(index, 'name', e.target.value)}
                      placeholder="مثال: CBC, Vitamin D"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={test.result}
                      onChange={(e) => updateTest(index, 'result', e.target.value)}
                      placeholder="النتيجة"
                      className="w-full text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300 font-bold text-violet-900"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={test.unit}
                      onChange={(e) => updateTest(index, 'unit', e.target.value)}
                      placeholder="mg/dL"
                      className="w-full text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={test.referenceRange}
                      onChange={(e) => updateTest(index, 'referenceRange', e.target.value)}
                      placeholder="70 - 99"
                      className="w-full text-center border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300 text-gray-500"
                    />
                  </td>
                  <td className="p-1.5">
                    <select
                      value={test.status}
                      onChange={(e) => updateTest(index, 'status', e.target.value)}
                      className={`w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-300 ${test.status ? STATUS_CONFIG[test.status as keyof typeof STATUS_CONFIG].color : ''} font-bold`}
                    >
                      <option value="">غير محدد</option>
                      <option value="normal" className="text-green-600">طبيعي (Normal)</option>
                      <option value="high" className="text-red-600">مرتفع (High)</option>
                      <option value="low" className="text-blue-600">منخفض (Low)</option>
                    </select>
                  </td>
                  <td className="p-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      className="text-red-400 hover:text-red-600"
                      title="حذف الفحص"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {(!data.tests || data.tests.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400 text-sm">
                    لا يوجد تحاليل مضافة. انقر على "إضافة فحص" للبدء.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات وقراءة الطبيب</label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="مثال: يوجد نقص حاد في فيتامين د، يجب البدء بالمكملات..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
        />
      </div>
    </div>
  );
};

// ─── Viewer Component (for patient records) ───────────────────────────────────
export const LaboratoriesViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as LaboratoriesData;
  if (!d) return null;

  return (
    <div className="bg-violet-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-violet-800 flex items-center gap-2">
        🔬 نتائج التحاليل المخبرية
      </h4>
      
      <div className="flex gap-4 text-sm text-gray-700">
        <span className="bg-white rounded-lg px-3 py-1 border border-violet-100">
          <strong>نوع العينة:</strong> {d.sampleType}
        </span>
        <span className="bg-white rounded-lg px-3 py-1 border border-violet-100">
          <strong>تاريخ السحب:</strong> {d.collectionDate}
        </span>
      </div>

      {(d.tests || []).length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-violet-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-violet-100">
              <tr>
                <th className="p-2 text-right text-gray-700">الفحص (Test)</th>
                <th className="p-2 text-center text-gray-700">النتيجة (Result)</th>
                <th className="p-2 text-center text-gray-700">المعدل الطبيعي</th>
                <th className="p-2 text-center text-gray-700">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {d.tests.map((test, index) => {
                const statusCfg = STATUS_CONFIG[test.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[''];
                return (
                  <tr key={index} className="border-t border-violet-50">
                    <td className="py-2 px-3 font-semibold text-gray-800">{test.name}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-black text-violet-900">{test.result}</span>
                      <span className="text-xs text-gray-500 ml-1 mr-1">{test.unit}</span>
                    </td>
                    <td className="py-2 px-3 text-center text-gray-500">{test.referenceRange || '—'}</td>
                    <td className="py-2 px-3 text-center">
                      {test.status && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color} border`}>
                          {statusCfg.label}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {d.notes && (
        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-violet-100 leading-relaxed">
          <strong>قراءة الطبيب / ملاحظات:</strong> {d.notes}
        </p>
      )}
    </div>
  );
};

export default LaboratoriesTemplate;
