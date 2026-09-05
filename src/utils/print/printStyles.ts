// ===================================================
// 🖨️ الأنماط المشتركة لجميع نماذج الطباعة — Doctor Jo
// ===================================================

/** شعار Doctor Jo مُضمَّن كـ SVG نصي (fallback بدون صورة) */
export const DOCTOR_JO_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40">
  <rect width="120" height="40" rx="8" fill="#1a3166"/>
  <text x="12" y="15" font-family="Arial,sans-serif" font-size="7" fill="#6C63FF" font-weight="bold">DOCTOR</text>
  <text x="12" y="28" font-family="Arial,sans-serif" font-size="14" fill="#F97316" font-weight="bold">Jo</text>
  <text x="45" y="28" font-family="Arial,sans-serif" font-size="6" fill="rgba(255,255,255,0.7)">PATIENT PORTAL</text>
  <circle cx="105" cy="20" r="10" fill="rgba(108,99,255,0.3)" stroke="#6C63FF" stroke-width="1.5"/>
  <text x="105" y="24" font-family="Arial,sans-serif" font-size="10" fill="white" text-anchor="middle" font-weight="bold">+</text>
</svg>`;

/** CSS المشترك لكل النماذج */
export const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

  * { 
    margin: 0; padding: 0; box-sizing: border-box; 
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  body {
    font-family: 'Cairo', 'Arial', sans-serif;
    background: #f8faff;
    direction: rtl;
    color: #1e293b;
    font-size: 13px;
    line-height: 1.6;
  }

  .page {
    max-width: 794px;
    margin: 0 auto;
    background: white;
    min-height: 1123px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 40px rgba(0,0,0,0.08);
  }

  /* ── الترويسة ── */
  .header {
    background: linear-gradient(135deg, #0d1b40 0%, #1a3166 60%, #1e3a8a 100%);
    padding: 24px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(108,99,255,0.12);
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -20px; left: 80px;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(249,115,22,0.08);
  }
  .header-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 22px;
    font-weight: 900;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    z-index: 10;
  }
  .header-clinic {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
  }
  .clinic-logo-box {
    width: 60px; height: 60px;
    border-radius: 14px;
    background: rgba(255,255,255,0.12);
    border: 2px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .clinic-logo-box img {
    width: 100%; height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
  .clinic-info { flex: 1; }
  .clinic-name {
    font-size: 18px; font-weight: 800;
    color: white; margin-bottom: 3px;
  }
  .clinic-specialty {
    font-size: 12px; color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.1);
    padding: 2px 10px; border-radius: 12px;
    display: inline-block; margin-bottom: 4px;
  }
  .clinic-contact {
    font-size: 11px; color: rgba(255,255,255,0.6);
    display: flex; gap: 14px; margin-top: 4px;
  }
  .clinic-contact span { display: flex; align-items: center; gap: 4px; }

  .doctor-jo-logo {
    display: flex; flex-direction: column;
    align-items: flex-end; gap: 4px;
    flex-shrink: 0;
  }
  .dj-badge {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    padding: 8px 14px;
    text-align: center;
  }
  .dj-top {
    font-size: 8px; font-weight: 700;
    color: #6C63FF; letter-spacing: 1px;
    text-transform: uppercase;
  }
  .dj-name {
    font-size: 22px; font-weight: 800;
    color: white; line-height: 1;
  }
  .dj-name span { color: #F97316; }
  .dj-sub {
    font-size: 8px; color: rgba(255,255,255,0.5);
    letter-spacing: 0.5px;
  }

  /* ── شريط نوع الوثيقة ── */
  .doc-type-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 32px;
    color: white;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.3px;
  }
  .doc-type-icon {
    font-size: 22px;
  }

  /* ── جسم الوثيقة ── */
  .body {
    flex: 1;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ── معلومات المريض والتاريخ ── */
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    background: #f8faff;
    border-radius: 12px;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
  }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-label {
    font-size: 10px; font-weight: 700;
    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .meta-value {
    font-size: 14px; font-weight: 600; color: #1e293b;
  }

  /* ── قسم المحتوى ── */
  .section {
    border-radius: 12px;
    padding: 16px 18px;
    border: 1px solid;
    page-break-inside: avoid;
  }
  .section-title {
    font-size: 13px; font-weight: 800;
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px; padding-bottom: 8px;
    border-bottom: 1px solid;
  }
  .section-title .icon { font-size: 16px; }
  .section-body {
    font-size: 13px; line-height: 1.9;
    color: #374151;
  }

  /* ── حقل واحد ── */
  .field-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed #e2e8f0;
  }
  .field-row:last-child { border-bottom: none; }
  .field-label {
    font-size: 12px; font-weight: 700; color: #64748b;
    min-width: 100px; flex-shrink: 0;
  }
  .field-value {
    font-size: 13px; color: #1e293b; font-weight: 500; flex: 1;
  }

  /* ── توقيع / ختم ── */
  .signature-area {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px dashed #e2e8f0;
  }
  .sig-block {
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
  }
  .sig-line {
    width: 160px; height: 1px; background: #94a3b8;
  }
  .sig-label { font-size: 11px; color: #94a3b8; }

  /* ── ختم دايناميك ── */
  .dynamic-stamp {
    border: 2px solid #0284c7;
    border-radius: 6px;
    padding: 2px;
    display: inline-block;
    transform: rotate(-5deg);
    opacity: 0.75;
    white-space: nowrap;
  }
  .stamp-inner {
    border: 1px dashed #0284c7;
    border-radius: 4px;
    padding: 6px 12px;
    text-align: center;
    background: rgba(2, 132, 199, 0.02);
  }
  .stamp-clinic {
    font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase;
  }
  .stamp-doctor {
    font-size: 9px; font-weight: 700; color: #0284c7; margin-top: 2px;
  }
  .stamp-date {
    font-size: 8px; font-weight: 600; color: #0284c7; margin-top: 2px;
  }

  /* ── التذييل ── */
  .footer {
    background: linear-gradient(135deg, #0d1b40, #1a3166);
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
  .footer-brand {
    display: flex; align-items: center; gap: 10px;
  }
  .footer-logo-text {
    font-size: 20px; font-weight: 800; color: white;
  }
  .footer-logo-text span { color: #F97316; }
  .footer-tagline {
    font-size: 10px; color: rgba(255,255,255,0.5);
  }
  .footer-info {
    text-align: left;
    font-size: 10px; color: rgba(255,255,255,0.5);
    line-height: 1.8;
  }
  .footer-info strong { color: rgba(255,255,255,0.8); }

  /* ── مربع تحذير/ملاحظة ── */
  .notice-box {
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @media print {
    @page { margin: 0; size: A4; }
    html, body { height: 100%; margin: 0; padding: 0; background: white; }
    .page { 
      box-shadow: none; 
      min-height: 100%;
      height: 100%;
      max-width: 100%;
      margin: 0; 
      page-break-after: avoid;
      overflow: hidden;
    }
    .action-bar { display: none !important; }
  }
`;

/** بناء ترويسة موحدة لكل النماذج */
export function buildHeader(params: {
  clinicName: string;
  clinicSpecialty?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicLogoUrl?: string | null;
  documentTitle?: string;
}): string {
  const { clinicName, clinicSpecialty, clinicPhone, clinicAddress, clinicLogoUrl, documentTitle } = params;

  const logoContent = clinicLogoUrl
    ? `<img src="${clinicLogoUrl}" alt="شعار العيادة" />`
    : `🏥`;

  const contactParts: string[] = [];
  if (clinicPhone) contactParts.push(`<span>📞 ${clinicPhone}</span>`);
  if (clinicAddress) contactParts.push(`<span>📍 ${clinicAddress}</span>`);

  return `
  <div class="header">
    <div class="header-clinic">
      <div class="clinic-logo-box">${logoContent}</div>
      <div class="clinic-info">
        <div class="clinic-name">${clinicName}</div>
        ${clinicSpecialty ? `<div class="clinic-specialty">${clinicSpecialty}</div>` : ''}
        ${contactParts.length > 0 ? `<div class="clinic-contact">${contactParts.join('')}</div>` : ''}
      </div>
    </div>
    
    ${documentTitle ? `<div class="header-title">${documentTitle}</div>` : ''}

    <div class="doctor-jo-logo">
      <div class="dj-badge">
        <div class="dj-top">DOCTOR</div>
        <div class="dj-name">D<span>o</span>ctor <span>J</span>o</div>
        <div class="dj-sub">PATIENT PORTAL</div>
      </div>
    </div>
  </div>`;
}

/** بناء تذييل موحد */
export function buildFooter(): string {
  const year = new Date().getFullYear();
  return `
  <div class="footer">
    <div class="footer-brand">
      <div style="font-size:28px; font-weight:800; color:white;">
        D<span style="color:#F97316">o</span>ctor <span style="color:#6C63FF">J</span>o
      </div>
      <div>
        <div style="font-size:11px;color:rgba(255,255,255,0.8);font-weight:600;">نظام إدارة العيادات الطبية</div>
        <div style="font-size:9px;color:rgba(255,255,255,0.45);">هذا النموذج صادر إلكترونياً من نظام Doctor Jo</div>
      </div>
    </div>
    <div class="footer-info">
      <strong>doctor-jo.com</strong><br/>
      © ${year} Doctor Jo — جميع الحقوق محفوظة
    </div>
  </div>`;
}

/** معلومات المريض والتاريخ */
export function buildMetaGrid(params: {
  patientName: string;
  doctorName: string;
  visitDate: string;
  visitTime?: string;
  recordId: number;
}): string {
  const { patientName, doctorName, visitDate, visitTime, recordId } = params;
  const printDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  return `
  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">اسم المريض</span>
      <span class="meta-value" style="color: #3B82F6;">${patientName}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">الطبيب المعالج</span>
      <span class="meta-value">د. ${doctorName}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">تاريخ الزيارة</span>
      <span class="meta-value">${visitDate}${visitTime ? ' — ' + visitTime : ''}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">رقم السجل</span>
      <span class="meta-value">#${recordId}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">تاريخ الطباعة</span>
      <span class="meta-value">${printDate}</span>
    </div>
  </div>`;
}

/** بناء ختم دايناميك يوضع مكان ختم العيادة */
export function buildDynamicStamp(params: {
  clinicName: string;
  doctorName: string;
  visitDate: string;
}): string {
  const { clinicName, doctorName, visitDate } = params;
  return `
  <div class="dynamic-stamp">
    <div class="stamp-inner">
      <div class="stamp-clinic">${clinicName}</div>
      <div class="stamp-doctor">د. ${doctorName}</div>
      <div class="stamp-date">${visitDate}</div>
    </div>
  </div>`;
}
