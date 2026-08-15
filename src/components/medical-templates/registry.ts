import React from 'react';
import { MedicalTemplate } from './types';
import OphthalmologyTemplate, { OphthalmologyViewer } from './specialties/ophthalmology';
import DentistryTemplate, { DentistryViewer } from './specialties/dentistry';
import ObGynTemplate, { ObGynViewer } from './specialties/ob-gyn';
import LaboratoriesTemplate, { LaboratoriesViewer } from './specialties/laboratories';
import CardiologyTemplate, { CardiologyViewer } from './specialties/cardiology';
import PediatricsTemplate, { PediatricsViewer } from './specialties/pediatrics';
import EndocrinologyTemplate, { EndocrinologyViewer } from './specialties/endocrinology';
import OrthopedicsTemplate, { OrthopedicsViewer } from './specialties/orthopedics';
import DermatologyTemplate, { DermatologyViewer } from './specialties/dermatology';

// ─────────────────────────────────────────────────────────────────────────────
// قاموس التخصصات الطبية — المحرك الرئيسي لنظام النماذج
//
// لإضافة تخصص جديد (مثلاً: أمراض القلب):
//   1. أنشئ مجلداً جديداً: src/components/medical-templates/specialties/cardiology/
//   2. أنشئ ملف index.tsx بداخله
//   3. أضف سطراً واحداً هنا في هذا القاموس
//   ✅ النظام كله سيتعرف عليه تلقائياً — لا تعديل في أي ملف آخر
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: Record<string, MedicalTemplate> = {
  ophthalmology: {
    id: 'ophthalmology',
    label: 'طب العيون',
    icon: '👁️',
    keywords: ['عيون', 'eye', 'ophthalmology', 'بصريات', 'optometry', 'نظر'],
    Component: OphthalmologyTemplate,
    ViewerComponent: OphthalmologyViewer,
  },
  dentistry: {
    id: 'dentistry',
    label: 'طب الأسنان',
    icon: '🦷',
    keywords: ['أسنان', 'dental', 'dentistry', 'فم', 'oral'],
    Component: DentistryTemplate,
    ViewerComponent: DentistryViewer,
  },
  'ob-gyn': {
    id: 'ob-gyn',
    label: 'النسائية والتوليد',
    icon: '🤰',
    keywords: ['نسائية', 'توليد', 'obstetrics', 'gynecology', 'ob-gyn', 'حمل', 'pregnancy'],
    Component: ObGynTemplate,
    ViewerComponent: ObGynViewer,
  },
  laboratories: {
    id: 'laboratories',
    label: 'المختبرات والتحاليل',
    icon: '🔬',
    keywords: ['مختبر', 'تحاليل', 'lab', 'laboratory', 'فحص دم', 'تحليل'],
    Component: LaboratoriesTemplate,
    ViewerComponent: LaboratoriesViewer,
  },
  cardiology: {
    id: 'cardiology',
    label: 'القلب والشرايين',
    icon: '🫀',
    keywords: ['قلب', 'شرايين', 'ضغط', 'cardiology', 'cardiac', 'heart', 'ecg', 'رسم قلب'],
    Component: CardiologyTemplate,
    ViewerComponent: CardiologyViewer,
  },
  pediatrics: {
    id: 'pediatrics',
    label: 'طب الأطفال',
    icon: '🧒',
    keywords: ['أطفال', 'طفل', 'pediatrics', 'لقاحات', 'تطعيم', 'تطور'],
    Component: PediatricsTemplate,
    ViewerComponent: PediatricsViewer,
  },
  endocrinology: {
    id: 'endocrinology',
    label: 'الغدد الصماء والسكري',
    icon: '🧬',
    keywords: ['غدد', 'سكري', 'سكر', 'endocrinology', 'diabetes', 'thyroid', 'درقية'],
    Component: EndocrinologyTemplate,
    ViewerComponent: EndocrinologyViewer,
  },
  orthopedics: {
    id: 'orthopedics',
    label: 'جراحة العظام والمفاصل',
    icon: '🦴',
    keywords: ['عظام', 'مفاصل', 'كسر', 'orthopedics', 'bones', 'عظم', 'ركبة'],
    Component: OrthopedicsTemplate,
    ViewerComponent: OrthopedicsViewer,
  },
  dermatology: {
    id: 'dermatology',
    label: 'الجلدية والتجميل',
    icon: '✨',
    keywords: ['جلدية', 'تجميل', 'ليزر', 'بوتكس', 'بشرة', 'dermatology', 'laser', 'botox', 'فيلر', 'تصبغات'],
    Component: DermatologyTemplate,
    ViewerComponent: DermatologyViewer,
  },
};

/**
 * تكشف تلقائياً النموذج المناسب بناءً على تخصص العيادة أو الطبيب
 * @param specialty - نص تخصص العيادة من الإعدادات
 * @returns النموذج المناسب أو null إذا لم يوجد تخصص مدعوم
 */
export function detectTemplate(specialty: string | undefined | null): MedicalTemplate | null {
  if (!specialty) return null;
  const lower = specialty.toLowerCase().trim();
  return (
    Object.values(TEMPLATE_REGISTRY).find((t) =>
      t.keywords.some((k) => lower.includes(k))
    ) ?? null
  );
}

/**
 * جلب نموذج معين مباشرةً بواسطة معرفه
 */
export function getTemplate(id: string): MedicalTemplate | null {
  return TEMPLATE_REGISTRY[id] ?? null;
}
