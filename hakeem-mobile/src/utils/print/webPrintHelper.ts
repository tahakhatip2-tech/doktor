export function printHtmlString(htmlString: string, title: string) {
  // Create a hidden iframe or open a new window
  const printWindow = window.open('', '_blank', 'width=800,height=900,left=200,top=100');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة (Pop-ups) لطباعة النموذج');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlString);
  printWindow.document.close();
  
  // Wait for images to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // Optionally close the window after printing (user preference, but nice to keep it open in case they want to save as PDF)
      // printWindow.close();
    }, 500);
  };
}
