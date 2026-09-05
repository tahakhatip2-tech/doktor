// ===================================================
// 🏥 نموذج الإجازة المرضية — Doctor Jo (محدث وبطاقة مدمجة)
// ===================================================

import { BASE_CSS, buildHeader, buildFooter, buildMetaGrid, buildDynamicStamp } from './printStyles';

interface SickLeaveData {
  recordId: number;
  patientName: string;
  clinicName: string;
  clinicSpecialty?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string | null;
  doctorName: string;
  visitDate: string;
  visitDateRaw?: string;
  sickLeaveDays: number;
  sickLeaveReason?: string;
  diagnosis?: string;
}

const PRIMARY_COLOR = '#0ea5e9'; // changed to blue/sky as requested
const BG_COLOR = '#f0f9ff';
const BORDER_COLOR = '#bae6fd';
const DARK_COLOR = '#0369a1';

// SVG Icons from Lucide
const ICONS = {
  bed: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
  stethoscope: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2.01A7 7 0 0 1 18 9v8"/><path d="M11 2.01A7 7 0 0 0 4 9v8"/><path d="M4 17a5 5 0 0 0 10 0v-8"/><path d="M18 17a5 5 0 0 0 5-5"/><path d="M14 17h4"/></svg>`,
  clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`
};

export function buildSickLeaveHTML(data: SickLeaveData): string {
  const {
    recordId, patientName, clinicName, clinicSpecialty, clinicPhone, clinicAddress,
    clinicLogoUrl, doctorName, visitDate, visitDateRaw,
    sickLeaveDays, sickLeaveReason, diagnosis,
  } = data;

  // حساب تاريخ انتهاء الإجازة بشكل سليم
  const startDate = visitDateRaw ? new Date(visitDateRaw) : new Date();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + sickLeaveDays - 1);
  const endDateStr = endDate.toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const slStyles = `
    .doc-type-bar { background: linear-gradient(90deg, ${PRIMARY_COLOR}, #0284c7); }
    .sig-line { background: ${PRIMARY_COLOR}; }

    /* بطاقة الإجازة المدمجة */
    .combined-card {
      background: ${BG_COLOR};
      border: 2px solid ${BORDER_COLOR};
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .card-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px dashed ${BORDER_COLOR};
      padding-bottom: 12px;
    }

    .sl-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .sl-icon-wrapper {
      width: 40px; height: 40px;
      background: white;
      border-radius: 10px;
      display: flex; justify-content: center; align-items: center;
      color: ${PRIMARY_COLOR};
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
    }
    .sl-icon-wrapper svg { width: 20px; height: 20px; }

    .sl-title {
      font-size: 18px; font-weight: 900; color: ${DARK_COLOR};
    }
    .sl-subtitle {
      font-size: 11px; font-weight: 600; color: #0284c7; margin-top: 2px;
    }

    .days-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 60px; height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #0284c7);
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      flex-shrink: 0;
    }
    .days-number {
      font-size: 24px; font-weight: 900; line-height: 1;
    }
    .days-label {
      font-size: 11px; font-weight: 700; opacity: 0.95;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .detail-item {
      background: white;
      border-radius: 8px;
      padding: 10px 14px;
      border: 1px solid ${BORDER_COLOR};
    }

    .detail-label {
      font-size: 12px; font-weight: 800; color: ${PRIMARY_COLOR};
      margin-bottom: 6px;
      display: flex; align-items: center; gap: 6px;
    }
    
    .detail-value {
      font-size: 14px; font-weight: 600; color: #1e293b; line-height: 1.6;
    }

    .dates-row {
      display: flex; gap: 12px;
    }

    .date-box {
      flex: 1;
      background: rgba(255,255,255,0.6);
      border-radius: 8px; padding: 10px 14px;
      border: 1px dashed ${BORDER_COLOR};
      display: flex; flex-direction: column; gap: 2px;
    }
    .date-lbl { font-size: 11px; font-weight: 700; color: #64748b; }
    .date-val { font-size: 13px; font-weight: 800; color: ${DARK_COLOR}; }

    .official-box {
      border: 2px dashed ${PRIMARY_COLOR};
      border-radius: 12px;
      padding: 14px 18px;
      text-align: center;
      background: rgba(14, 165, 233, 0.05);
    }
    .official-text {
      font-size: 14px; font-weight: 700; color: ${DARK_COLOR};
      line-height: 1.8;
    }
  `;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>إجازة مرضية — ${clinicName}</title>
  <style>
    ${BASE_CSS}
    ${slStyles}
  </style>
</head>
<body>
<div class="page">

  ${buildHeader({ clinicName, clinicSpecialty, clinicPhone, clinicAddress, clinicLogoUrl })}

  <div class="body">

    ${buildMetaGrid({ patientName, doctorName, visitDate, recordId })}

    <!-- البطاقة المدمجة الزرقاء -->
    <div class="combined-card">
      
      <!-- عنوان البطاقة وعدد الأيام -->
      <div class="card-header-row">
        <div class="sl-title-box">
          <div class="sl-icon-wrapper">${ICONS.bed}</div>
          <div>
            <div class="sl-title">إجازة مرضية</div>
            <div class="sl-subtitle">استراحة طبية موصى بها للمريض</div>
          </div>
        </div>
        <div class="days-badge">
          <div class="days-number">${sickLeaveDays}</div>
          <div class="days-label">${sickLeaveDays === 1 ? 'يوم' : 'أيام'}</div>
        </div>
      </div>

      <!-- التواريخ -->
      <div class="dates-row">
        <div class="date-box">
          <div class="date-lbl">تاريخ البدء</div>
          <div class="date-val">${visitDate}</div>
        </div>
        <div class="date-box">
          <div class="date-lbl">تاريخ الانتهاء</div>
          <div class="date-val">${endDateStr}</div>
        </div>
      </div>

      <div class="details-grid">
        ${diagnosis ? `
        <div class="detail-item">
          <div class="detail-label">${ICONS.stethoscope} التشخيص الطبي</div>
          <div class="detail-value">${diagnosis}</div>
        </div>` : ''}

        ${sickLeaveReason ? `
        <div class="detail-item">
          <div class="detail-label">${ICONS.clipboard} تفاصيل / سبب الإجازة</div>
          <div class="detail-value">${sickLeaveReason}</div>
        </div>` : ''}
      </div>

    </div>

    <!-- النص الرسمي -->
    <div class="official-box">
      <div class="official-text">
        يُشهد بأن المريض / المريضة <strong>${patientName}</strong> يعاني من حالة صحية تستوجب الراحة التامة<br/>
        ويُوصى بمنحه إجازة مرضية مدتها <strong>${sickLeaveDays} ${sickLeaveDays === 1 ? 'يوم' : 'أيام'}</strong><br/>
        من تاريخ <strong>${visitDate}</strong> حتى <strong>${endDateStr}</strong>
      </div>
    </div>

    <!-- توقيع -->
    <div class="signature-area">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">ختم العيادة</div>
      </div>
      <div style="text-align:center; color:#94a3b8; font-size:11px;">
        <div style="color:${PRIMARY_COLOR}; display:flex; justify-content:center; margin-bottom:4px;">${ICONS.bed}</div>
        <div>وثيقة طبية رسمية</div>
        <div style="font-size:9px;">Official Medical Document</div>
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
