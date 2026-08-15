// ─── أنواع البيانات المشتركة لنظام النماذج الطبية ───────────────────
// لإضافة تخصص جديد، لا تعدل هذا الملف — فقط أضف نوع البيانات الخاص به
// في ملف types.ts داخل مجلد التخصص الجديد

export interface TemplateProps {
  /** البيانات الحالية للنموذج */
  value: Record<string, any>;
  /** دالة تُستدعى عند أي تغيير في بيانات النموذج */
  onChange: (data: Record<string, any>) => void;
}

export interface ViewerProps {
  /** بيانات النموذج المحفوظة في السجل الطبي */
  data: Record<string, any>;
}

export interface MedicalTemplate {
  /** معرف فريد للتخصص (مثال: 'ophthalmology') */
  id: string;
  /** الاسم المعروض للمستخدم (مثال: 'طب العيون') */
  label: string;
  /** أيقونة emoji للتخصص */
  icon: string;
  /** كلمات مفتاحية للكشف التلقائي عن التخصص من إعدادات العيادة */
  keywords: string[];
  /** مكون نموذج الإدخال (يظهر عند إكمال الموعد) */
  Component: React.FC<TemplateProps>;
  /** مكون عرض البيانات المحفوظة (يظهر في السجل الطبي) */
  ViewerComponent: React.FC<ViewerProps>;
}
