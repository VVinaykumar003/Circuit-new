import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ColumnConfig } from '@/type/importExport.types';

export const exportPDF = (data: any[], columns: ColumnConfig[], filename: string, title: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  const tableData = data.map(row => columns.map(col => String(row[col.key] ?? "")));

  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 25,
  });

  doc.save(`${filename}.pdf`);
};