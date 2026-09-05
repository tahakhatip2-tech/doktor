// ===================================================
// ↗ نموذج التحويلة الطبية — Doctor Jo
// ===================================================

import { BASE_CSS, buildHeader, buildFooter, buildMetaGrid, buildDynamicStamp } from './printStyles';

interface ReferralData {
  recordId: number;
  patientName: string;
  clinicName: string;
  clinicSpecialty?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string | null;
  doctorName: string;
  visitDate: string;
  visitTime?: string;
  referralTo: string;
  referralReason?: string;
  diagnosis?: string;
  treatment?: string;
  urgency?: 'routine' | 'urgent' | 'emergency';
}

const PRIMARY_COLOR = '#3B82F6';
const BG_COLOR = '#EFF6FF';
const BORDER_COLOR = '#BFDBFE';
const DARK_COLOR = '#1E40AF';

export function buildReferralHTML(data: ReferralData): string {
  const {
    recordId, patientName, clinicName, clinicSpecialty, clinicPhone, clinicAddress,
    clinicLogoUrl, doctorName, visitDate, visitTime,
    referralTo, referralReason, diagnosis, treatment, urgency,
  } = data;

  const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
    routine:   { label: 'روتيني', color: '#10B981', bg: '#D1FAE5' },
    urgent:    { label: 'عاجل', color: '#F59E0B', bg: '#FEF3C7' },
    emergency: { label: 'طارئ', color: '#EF4444', bg: '#FEE2E2' },
  };
  const urg = urgencyConfig[urgency || 'routine'];

  const refStyles = `
    .doc-type-bar { background: linear-gradient(90deg, ${PRIMARY_COLOR}, #2563EB); display:flex; align-items:center; justify-content:center; gap:10px; color:white; padding:10px; font-weight:bold; }
    .section { background: ${BG_COLOR}; border-color: ${BORDER_COLOR}; border-style:solid; border-width:1px; padding:15px; margin-bottom:15px; border-radius:8px; }
    .section-title { color: ${DARK_COLOR}; border-bottom: 1px solid ${BORDER_COLOR}; margin-bottom:10px; padding-bottom:5px; font-weight:bold; display:flex; align-items:center; }
    .sig-line { background: ${PRIMARY_COLOR}; height:2px; margin-top:20px; }
    .field-row { display: flex; margin-bottom: 8px; }
    .field-label { font-weight: 700; min-width: 120px; color: #475569; }
    .field-value { flex: 1; }

    .referral-arrow-card {
      display: flex;
      align-items: center;
      gap: 0;
      background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
      border: 2px solid ${BORDER_COLOR};
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .ref-from, .ref-to {
      flex: 1; padding: 18px 20px; text-align: center;
    }
    .ref-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: #64748b; margin-bottom: 4px;
    }
    .ref-name {
      font-size: 15px; font-weight: 800; color: ${DARK_COLOR};
    }
    .ref-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    .ref-arrow {
      width: 48px; flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: ${PRIMARY_COLOR}; color: white;
      font-size: 22px; padding: 18px 0;
      align-self: stretch;
    }
    .urgency-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px; font-weight: 700;
      margin-bottom: 12px;
    }
  `;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>تحويلة طبية — ${clinicName}</title>
  <style>
    ${BASE_CSS}
    ${refStyles}
  </style>
</head>
<body>
<div class="page">

  ${buildHeader({ clinicName, clinicSpecialty, clinicPhone, clinicAddress, clinicLogoUrl })}

  <!-- شريط نوع الوثيقة -->
  <div class="doc-type-bar">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
    نموذج تحويل طبي رسمي
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
  </div>

  <div class="body">

    ${buildMetaGrid({ patientName, doctorName, visitDate, visitTime, recordId })}

    <!-- درجة الإلحاح -->
    ${urgency && urgency !== 'routine' ? `
    <div style="text-align:center;">
      <div class="urgency-badge" style="background:${urg.bg}; color:${urg.color}; border: 1px solid ${urg.color}30;">
        ${urgency === 'urgent' ? '⚡' : '🚨'} ${urg.label}
      </div>
    </div>` : ''}

    <!-- سهم التحويل: من العيادة ← إلى الجهة -->
    <div class="referral-arrow-card">
      <div class="ref-from">
        <div class="ref-label">محول من</div>
        <div class="ref-name">${clinicName}</div>
        ${clinicSpecialty ? `<div class="ref-sub">${clinicSpecialty}</div>` : ''}
        <div class="ref-sub">د. ${doctorName}</div>
      </div>
      <div class="ref-arrow">→</div>
      <div class="ref-to">
        <div class="ref-label">محول إلى</div>
        <div class="ref-name" style="color:${DARK_COLOR};">${referralTo}</div>
        <div class="ref-sub">الجهة الطبية المحوّل إليها</div>
      </div>
    </div>

    <!-- بيانات التحويل -->
    <div class="section" style="background:#F0FDF4; border-color:#BBF7D0;">
      <div class="section-title" style="color:#16A34A; border-color:#BBF7D0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> بيانات التحويل
      </div>
      <div class="field-row">
        <div class="field-label">إلى الزميل / الجهة:</div>
        <div class="field-value">${referralTo}</div>
      </div>
      <div class="field-row">
        <div class="field-label">سبب التحويل:</div>
        <div class="field-value">${referralReason || '-'}</div>
      </div>
    </div>

    ${diagnosis ? `
    <!-- التشخيص المبدئي -->
    <div class="section">
      <div class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="M11 2.01A7 7 0 0 1 18 9v8"/><path d="M11 2.01A7 7 0 0 0 4 9v8"/><path d="M4 17a5 5 0 0 0 10 0v-8"/><path d="M18 17a5 5 0 0 0 5-5"/><path d="M14 17h4"/></svg> التشخيص المبدئي
      </div>
      <div class="section-body">${diagnosis}</div>
    </div>` : ''}

    ${treatment ? `
    <!-- الخطة العلاجية -->
    <div class="section">
      <div class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="M12 2v20M2 12h20"/></svg> الخطة العلاجية الحالية
      </div>
      <div class="section-body">${treatment}</div>
    </div>` : ''}

    <!-- نص رسمي -->
    <div style="
      border: 2px dashed ${PRIMARY_COLOR};
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      background: rgba(59,130,246,0.04);
      font-size: 13px; color: ${DARK_COLOR}; font-weight: 600; line-height: 1.9;
    ">
      يُرجى تقديم الرعاية الطبية اللازمة وإفادتنا بنتائج التقييم<br/>
      مع خالص التقدير والاحترام
    </div>

    <!-- توقيع -->
    <div class="signature-area">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">ختم العيادة</div>
      </div>
      <div style="text-align:center; color:#94a3b8; font-size:11px;">
        <div style="font-size:24px; color:${PRIMARY_COLOR};">🔵</div>
        <div>تحويلة طبية رسمية</div>
        <div style="font-size:9px;">Official Medical Referral</div>
      </div>
      <div class="sig-block" style="position: relative; min-height: 60px; justify-content: flex-end;">
        <div style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); z-index: 10; pointer-events: none;">
          ${buildDynamicStamp({ clinicName, doctorName, visitDate })}
        </div>
        <div class="sig-line"></div>
        <div class="sig-label">توقيع الطبيب</div>
      </div>
    </div>

  </div>

  ${buildFooter()}

</div>
</body>
</html>`;
}
