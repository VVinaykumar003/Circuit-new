import Papa from 'papaparse';
import type { ColumnConfig } from '@/type/importExport.types';

export const exportCSV = (data: any[], columns: ColumnConfig[], filename: string) => {
  // Map data to selected columns with labels as headers
  const mappedData = data.map(row => {
    const newRow: any = {};
    columns.forEach(col => {
      newRow[col.label] = row[col.key] ?? "";
    });
    return newRow;
  });

  const csv = Papa.unparse(mappedData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};