// ===================================================
// 💊 نموذج الوصفة الطبية — Doctor Jo
// ===================================================

import { BASE_CSS, buildHeader, buildFooter, buildMetaGrid, buildDynamicStamp } from './printStyles';

interface PrescriptionData {
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
  diagnosis?: string;
  treatment: string;
  medications?: string;
  prescriptionNotes?: string;
}

const PRIMARY_COLOR = '#10B981';
const BG_COLOR = '#ECFDF5';
const BORDER_COLOR = '#A7F3D0';

export function buildPrescriptionHTML(data: PrescriptionData): string {
  const {
    recordId, patientName, clinicName, clinicSpecialty, clinicPhone, clinicAddress,
    clinicLogoUrl, doctorName, visitDate, visitTime,
    diagnosis, treatment, medications, prescriptionNotes,
  } = data;

  const rxStyles = `
    .doc-type-bar { background: linear-gradient(90deg, ${PRIMARY_COLOR}, #059669); }
    .section { background: ${BG_COLOR}; border-color: ${BORDER_COLOR}; }
    .section-title { color: ${PRIMARY_COLOR}; border-color: ${BORDER_COLOR}; }
    .sig-line { background: ${PRIMARY_COLOR}; }
    .rx-symbol {
      font-size: 42px; font-weight: 900; color: ${PRIMARY_COLOR};
      font-family: serif; line-height: 1;
      border: 3px solid ${PRIMARY_COLOR};
      border-radius: 50%; width: 60px; height: 60px;
      display: flex; align-items: center; justify-content: center;
      background: ${BG_COLOR};
    }
    .notice-valid {
      background: #FEF3C7; border: 1px solid #FCD34D; color: #92400E;
      border-radius: 8px; padding: 8px 14px; font-size: 11px;
      display: flex; align-items: center; gap: 6px; margin-top: 8px;
    }
    .med-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 14px; background: white; border-radius: 10px;
      border: 1px solid ${BORDER_COLOR}; margin-bottom: 8px;
    }
    .med-bullet {
      width: 28px; height: 28px; border-radius: 50%;
      background: ${PRIMARY_COLOR}; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 13px; flex-shrink: 0; margin-top: 2px;
    }
    .med-text { font-size: 13px; color: #1e293b; line-height: 1.7; }
  `;

  // تقسيم قائمة الأدوية إلى عناصر
  const buildMedsList = (meds: string) => {
    const lines = meds.split('\n').filter(l => l.trim());
    if (lines.length <= 1) {
      return `<div class="section-body">${meds}</div>`;
    }
    return lines.map((line, i) => `
      <div class="med-item">
        <div class="med-bullet">${i + 1}</div>
        <div class="med-text">${line.trim()}</div>
      </div>
    `).join('');
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>وصفة طبية — ${clinicName}</title>
  <style>
    ${BASE_CSS}
    ${rxStyles}
  </style>
</head>
<body>
<div class="page">

  ${buildHeader({ clinicName, clinicSpecialty, clinicPhone, clinicAddress, clinicLogoUrl })}

  <!-- شريط نوع الوثيقة -->
  <div class="doc-type-bar">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5 19 12a4.942 4.942 0 0 0 0-7 4.942 4.942 0 0 0-7 0l-8.5 8.5a4.942 4.942 0 0 0 0 7 4.942 4.942 0 0 0 7 0Z"/><path d="m14 10-4-4"/></svg>
    وصفة طبية رسمية
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5 19 12a4.942 4.942 0 0 0 0-7 4.942 4.942 0 0 0-7 0l-8.5 8.5a4.942 4.942 0 0 0 0 7 4.942 4.942 0 0 0 7 0Z"/><path d="m14 10-4-4"/></svg>
  </div>

  <div class="body">

    ${buildMetaGrid({ patientName, doctorName, visitDate, visitTime, recordId })}

    <!-- رمز Rx -->
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:-8px;">
      <div class="rx-symbol">Rx</div>
      <div>
        <div style="font-size:16px; font-weight:800; color:${PRIMARY_COLOR};">الوصفة الطبية</div>
        <div style="font-size:11px; color:#64748b;">Medical Prescription</div>
      </div>
    </div>

    ${diagnosis ? `
    <!-- التشخيص -->
    <div class="section" style="background:#EFF6FF; border-color:#BFDBFE;">
      <div class="section-title" style="color:#3B82F6; border-color:#BFDBFE;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="M11 2.01A7 7 0 0 1 18 9v8"/><path d="M11 2.01A7 7 0 0 0 4 9v8"/><path d="M4 17a5 5 0 0 0 10 0v-8"/><path d="M18 17a5 5 0 0 0 5-5"/><path d="M14 17h4"/></svg> التشخيص
      </div>
      <div class="section-body">${diagnosis}</div>
    </div>` : ''}

    <!-- الأدوية والعلاج -->
    <div class="section">
      <div class="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><path d="M10.5 20.5 19 12a4.942 4.942 0 0 0 0-7 4.942 4.942 0 0 0-7 0l-8.5 8.5a4.942 4.942 0 0 0 0 7 4.942 4.942 0 0 0 7 0Z"/><path d="m14 10-4-4"/></svg> الأدوية الموصوفة
      </div>
      ${buildMedsList(medications || treatment)}
    </div>

    ${prescriptionNotes ? `
    <!-- تعليمات إضافية -->
    <div class="section" style="background:#FFFBEB; border-color:#FDE68A;">
      <div class="section-title" style="color:#D97706; border-color:#FDE68A;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:8px;"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> تعليمات إضافية
      </div>
      <div class="section-body">${prescriptionNotes}</div>
    </div>` : ''}

    <!-- تحذير صلاحية -->
    <div class="notice-valid">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px;"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> هذه الوصفة صالحة لمدة شهر واحد من تاريخ إصدارها
    </div>

    <!-- توقيع -->
    <div class="signature-area">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">ختم العيادة</div>
      </div>
      <div style="text-align:center; color:#94a3b8; font-size:11px;">
        <img src="https://barcode.tec-it.com/barcode.ashx?data=RX-${recordId}&code=Code128&translate-esc=true" alt="Barcode" style="height: 40px; margin-bottom: 6px;" />
        <div>وصفة طبية رسمية</div>
        <div style="font-size:9px;">Official Medical Prescription</div>
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
