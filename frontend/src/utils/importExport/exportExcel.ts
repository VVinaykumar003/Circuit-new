import * as XLSX from 'xlsx';
import type { ColumnConfig } from '@/type/importExport.types';

export const exportExcel = (data: any[], columns: ColumnConfig[], filename: string) => {
  // Map data to selected columns with labels as headers
  const mappedData = data.map(row => {
    const newRow: any = {};
    columns.forEach(col => {
      newRow[col.label] = row[col.key] ?? "";
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};