import React from 'react';
import { detectTemplate, getTemplate } from './registry';

interface TemplateRendererProps {
  /** تخصص العيادة من الإعدادات */
  specialty?: string;
  /** معرف مباشر للتخصص (اختياري — يتجاوز الكشف التلقائي) */
  templateId?: string;
  /** البيانات الحالية للنموذج */
  value: Record<string, any>;
  /** دالة تُستدعى عند تغيير بيانات النموذج */
  onChange: (data: Record<string, any>) => void;
}

/**
 * مكون ذكي يكشف التخصص تلقائياً ويعرض النموذج المناسب.
 * لا يحتوي على أي if/else للتخصصات — يعتمد كلياً على الـ Registry.
 */
const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  specialty,
  templateId,
  value,
  onChange,
}) => {
  // الأولوية: معرف مباشر → كشف تلقائي
  const template = templateId
    ? getTemplate(templateId)
    : detectTemplate(specialty);

  if (!template) return null;

  const { Component, label, icon } = template;

  return (
    <div className="mt-4 border-t-2 border-dashed border-gray-200 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-gray-700">بيانات {label}</h3>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full mr-auto">
          نموذج متخصص
        </span>
      </div>
      <Component value={value || {}} onChange={onChange} />
    </div>
  );
};

export default TemplateRenderer;
