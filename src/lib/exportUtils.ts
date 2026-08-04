import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Utility to export an array of objects to an Excel (.xlsx) file
 * 
 * @param data Array of objects to export
 * @param fileName The base name of the exported file (without extension)
 * @param sheetName The name of the worksheet inside the Excel file
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    if (!data || data.length === 0) {
        return false;
    }

    try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert JSON data to worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Add styling or adjust column widths if needed
        // (Optional: you can add basic styling or width adjustments here)
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // Generate buffer and save file
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        XLSX.writeFile(wb, `${fileName}_${dateStr}.xlsx`);
        return true;
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return false;
    }
};
