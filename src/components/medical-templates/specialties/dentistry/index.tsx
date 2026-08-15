import React, { useState } from 'react';
import { TemplateProps, ViewerProps } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToothCondition = 'healthy' | 'caries' | 'filled' | 'crown' | 'missing' | 'extraction' | 'root_canal';

interface ToothData {
  condition: ToothCondition;
  notes?: string;
}

interface DentistryData {
  teeth: Record<number, ToothData>;
  generalNotes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITION_CONFIG: Record<ToothCondition, { label: string; color: string; bg: string }> = {
  healthy:      { label: 'سليم',       color: '#22c55e', bg: '#f0fdf4' },
  caries:       { label: 'تسوس',       color: '#ef4444', bg: '#fef2f2' },
  filled:       { label: 'حشوة',       color: '#3b82f6', bg: '#eff6ff' },
  crown:        { label: 'تاج',        color: '#a855f7', bg: '#faf5ff' },
  missing:      { label: 'مفقود',      color: '#9ca3af', bg: '#f9fafb' },
  extraction:   { label: 'يحتاج خلع', color: '#f97316', bg: '#fff7ed' },
  root_canal:   { label: 'علاج عصب',  color: '#ec4899', bg: '#fdf4ff' },
};

// Tooth numbers: upper jaw (right to left) then lower jaw (left to right)
const UPPER_TEETH = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
const LOWER_TEETH = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

// ─── Single Tooth Component ───────────────────────────────────────────────────
const Tooth: React.FC<{
  number: number;
  data?: ToothData;
  onClick: (num: number) => void;
}> = ({ number, data, onClick }) => {
  const condition = data?.condition || 'healthy';
  const config = CONDITION_CONFIG[condition];
  const isMissing = condition === 'missing';

  return (
    <button
      onClick={() => onClick(number)}
      title={`سن ${number} — ${config.label}`}
      className="flex flex-col items-center gap-0.5 group"
    >
      <span className="text-[9px] text-gray-400 font-mono">{number}</span>
      <div
        className="w-7 h-7 rounded-lg border-2 transition-all duration-150 group-hover:scale-110 group-hover:shadow-md flex items-center justify-center text-[10px] font-bold"
        style={{
          borderColor: config.color,
          backgroundColor: isMissing ? '#e5e7eb' : config.bg,
          color: config.color,
          opacity: isMissing ? 0.4 : 1,
        }}
      >
        {isMissing ? '×' : ''}
      </div>
    </button>
  );
};

// ─── Input Form Component ─────────────────────────────────────────────────────
const DentistryTemplate: React.FC<TemplateProps> = ({ value, onChange }) => {
  const data: DentistryData = {
    teeth: {},
    generalNotes: '',
    ...value,
  };

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedNotes, setSelectedNotes] = useState('');

  const handleToothClick = (num: number) => {
    setSelectedTooth(num);
    setSelectedNotes(data.teeth[num]?.notes || '');
  };

  const applyCondition = (condition: ToothCondition) => {
    if (selectedTooth === null) return;
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [selectedTooth]: { condition, notes: selectedNotes },
      },
    });
  };

  const saveNotes = () => {
    if (selectedTooth === null) return;
    onChange({
      ...data,
      teeth: {
        ...data.teeth,
        [selectedTooth]: {
          ...(data.teeth[selectedTooth] || { condition: 'healthy' }),
          notes: selectedNotes,
        },
      },
    });
  };

  return (
    <div className="space-y-4 p-1" dir="rtl">
      <h3 className="font-bold text-teal-700 flex items-center gap-2 text-base">
        🦷 مخطط الأسنان — انقر على السن لتحديد حالته
      </h3>

      {/* Dental Chart */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        {/* Upper Jaw */}
        <p className="text-center text-xs text-gray-400 mb-2 font-semibold">الفك العلوي</p>
        <div className="flex justify-center gap-1 flex-wrap">
          {UPPER_TEETH.map((n) => (
            <Tooth key={n} number={n} data={data.teeth[n]} onClick={handleToothClick} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 flex items-center gap-2">
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <span className="text-xs text-gray-400">خط الإطباق</span>
          <div className="flex-1 border-t border-dashed border-gray-300" />
        </div>

        {/* Lower Jaw */}
        <div className="flex justify-center gap-1 flex-wrap">
          {LOWER_TEETH.map((n) => (
            <Tooth key={n} number={n} data={data.teeth[n]} onClick={handleToothClick} />
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2 font-semibold">الفك السفلي</p>
      </div>

      {/* Condition Selector */}
      {selectedTooth !== null && (
        <div className="bg-white rounded-xl border border-teal-200 p-3 space-y-3">
          <p className="font-semibold text-gray-700 text-sm">
            السن رقم <span className="text-teal-600 font-bold">{selectedTooth}</span> — اختر الحالة:
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(CONDITION_CONFIG) as [ToothCondition, any][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => applyCondition(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all duration-150 hover:scale-105"
                style={{
                  borderColor: cfg.color,
                  backgroundColor: data.teeth[selectedTooth]?.condition === key ? cfg.bg : 'white',
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={selectedNotes}
              onChange={(e) => setSelectedNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="ملاحظة على هذا السن (اختياري)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(CONDITION_CONFIG) as [ToothCondition, any][]).map(([key, cfg]) => (
          <span
            key={key}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
            style={{ borderColor: cfg.color, color: cfg.color, backgroundColor: cfg.bg }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* General Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات عامة</label>
        <textarea
          value={data.generalNotes}
          onChange={(e) => onChange({ ...data, generalNotes: e.target.value })}
          placeholder="مثال: تنظيف جير، خطة علاجية..."
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
        />
      </div>
    </div>
  );
};

// ─── Viewer Component ─────────────────────────────────────────────────────────
export const DentistryViewer: React.FC<ViewerProps> = ({ data }) => {
  const d = data as DentistryData;
  if (!d) return null;

  const affectedTeeth = Object.entries(d.teeth || {}).filter(
    ([, td]) => td.condition !== 'healthy'
  );

  return (
    <div className="bg-teal-50 rounded-xl p-4 space-y-3" dir="rtl">
      <h4 className="font-bold text-teal-800 flex items-center gap-2">🦷 مخطط الأسنان</h4>

      {affectedTeeth.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {affectedTeeth.map(([toothNum, td]) => {
            const cfg = CONDITION_CONFIG[td.condition];
            return (
              <div
                key={toothNum}
                className="flex items-center gap-2 bg-white rounded-lg p-2 border text-sm"
                style={{ borderColor: cfg.color }}
              >
                <span className="font-bold text-gray-700">سن {toothNum}:</span>
                <span style={{ color: cfg.color }} className="font-medium">{cfg.label}</span>
                {td.notes && <span className="text-gray-500 text-xs">— {td.notes}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 bg-white rounded-lg p-2">جميع الأسنان سليمة</p>
      )}

      {d.generalNotes && (
        <p className="text-sm text-gray-600 bg-white rounded-lg p-2 border border-teal-100">
          <strong>ملاحظات:</strong> {d.generalNotes}
        </p>
      )}
    </div>
  );
};

export default DentistryTemplate;
