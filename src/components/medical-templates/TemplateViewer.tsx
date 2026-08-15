import React from 'react';
import { detectTemplate, getTemplate } from './registry';

interface TemplateViewerProps {
  /** بيانات النموذج المحفوظة في السجل الطبي */
  templateData: Record<string, any> | null | undefined;
  /** تخصص العيادة (للكشف التلقائي) */
  specialty?: string;
  /** معرف مباشر للتخصص (اختياري) */
  templateId?: string;
}

/**
 * مكون عرض بيانات النموذج الطبي في السجلات الطبية للمريض.
 * يعرض البيانات بتنسيق أنيق ومناسب لكل تخصص.
 */
const TemplateViewer: React.FC<TemplateViewerProps> = ({
  templateData,
  specialty,
  templateId,
}) => {
  if (!templateData || Object.keys(templateData).length === 0) return null;

  const template = templateId
    ? getTemplate(templateId)
    : detectTemplate(specialty);

  if (!template) return null;

  const { ViewerComponent } = template;

  return <ViewerComponent data={templateData} />;
};

export default TemplateViewer;
