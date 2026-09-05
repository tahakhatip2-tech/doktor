export function printHtmlString(htmlString: string, title: string) {
  // Create a hidden iframe or open a new window
  const printWindow = window.open('', '_blank', 'width=800,height=900,left=200,top=100');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة (Pop-ups) لطباعة النموذج');
    return;
  }
  const actionBarHtml = `
    <style>
      @media print { .no-print { display: none !important; } }
      .action-bar {
        background: #1e293b; padding: 12px 24px; display: flex; justify-content: flex-end; gap: 12px;
        position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        direction: rtl;
      }
      .action-btn {
        background: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;
        font-family: inherit; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 8px;
      }
      .action-btn.primary { background: #3b82f6; color: white; }
      .action-btn.primary:hover { background: #2563eb; }
    </style>
    <div class="action-bar no-print">
      <button class="action-btn primary" onclick="window.print()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        طباعة أو حفظ كـ PDF
      </button>
    </div>
  `;

  // Inject action bar after <body>
  const finalHtml = htmlString
    .replace('<body>', '<body>' + actionBarHtml);

  printWindow.document.open();
  printWindow.document.write(finalHtml);
  printWindow.document.close();
  
  // Wait for images to load before focusing
  printWindow.onload = () => {
    printWindow.focus();
  };
}
