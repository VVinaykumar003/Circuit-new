import type { ColumnConfig, ImportResult, ValidationError } from '@/type/importExport.types';

export const validateImportData = (data: any[], columns: ColumnConfig[]): ImportResult => {
  const validRows: any[] = [];
  const invalidRows: any[] = [];
  const errors: ValidationError[] = [];

  data.forEach((row, index) => {
    const mappedRow: any = {};
    let rowValid = true;
    const rowNumber = index + 2; // +1 for 0-index, +1 for header row

    columns.forEach(col => {
      // Value could be under the raw key or the label from the CSV/XLSX
      const value = row[col.key] !== undefined ? row[col.key] : row[col.label];
      mappedRow[col.key] = value;

      // Required validation
      if (col.required && (value === undefined || value === null || String(value).trim() === "")) {
        errors.push({ row: rowNumber, field: col.label, message: 'Field is required' });
        rowValid = false;
      }

      // Type validation (only if value exists)
      if (value) {
        if (col.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
          errors.push({ row: rowNumber, field: col.label, message: 'Invalid email format' });
          rowValid = false;
        }
        if (col.type === 'number' && isNaN(Number(value))) {
          errors.push({ row: rowNumber, field: col.label, message: 'Must be a valid number' });
          rowValid = false;
        }
        if (col.type === 'date' && isNaN(Date.parse(String(value)))) {
          errors.push({ row: rowNumber, field: col.label, message: 'Invalid date format' });
          rowValid = false;
        }
      }
    });

    if (rowValid) {
      validRows.push(mappedRow);
    } else {
      invalidRows.push(mappedRow);
    }
  });

  return {
    validRows, invalidRows, errors, totalProcessed: data.length
  };
};