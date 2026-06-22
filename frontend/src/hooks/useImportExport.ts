import { useState } from 'react';
import { toast } from 'react-toastify';
import type { ColumnConfig, ImportResult } from '@/type/importExport.types';
import { exportCSV } from '@/utils/importExport/exportCSV';
import { exportExcel } from '@/utils/importExport/exportExcel';
import { exportPDF } from '@/utils/importExport/exportPDF';
import { parseCSV, parseExcel } from '@/utils/importExport/parseFiles';
import { validateImportData } from '@/utils/importExport/validateImportData';

export const useImportExport = (moduleName: string, columns: ColumnConfig[]) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const triggerExport = (data: any[], format: 'csv' | 'xlsx' | 'pdf', selectedColumnKeys: string[]) => {
    setIsExporting(true);
    try {
      const exportCols = columns.filter(c => selectedColumnKeys.includes(c.key));
      const filename = `${moduleName}_Export_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') exportCSV(data, exportCols, filename);
      else if (format === 'xlsx') exportExcel(data, exportCols, filename);
      else if (format === 'pdf') exportPDF(data, exportCols, filename, `${moduleName} Export`);
      
      toast.success(`${moduleName} exported successfully to ${format.toUpperCase()}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadTemplate = () => {
    exportCSV([], columns, `${moduleName}_Import_Template`);
    toast.info('Template downloaded');
  };

  const processImportFile = async (file: File): Promise<ImportResult | null> => {
    setIsImporting(true);
    try {
      let rawData: any[] = [];
      if (file.name.endsWith('.csv')) {
        rawData = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx')) {
        rawData = await parseExcel(file);
      } else {
        throw new Error("Unsupported file format");
      }

      const validationResult = validateImportData(rawData, columns);
      return validationResult;
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse file');
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  const finalizeImport = async (validData: any[], options: any, uploadFn: (data: any[]) => Promise<void>) => {
    setIsImporting(true);
    try {
      await uploadFn(validData); // User-provided API call function
      toast.success(`Successfully imported ${validData.length} records!`);
    } catch (error) {
      toast.error('Failed to save imported records to database');
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    triggerExport, downloadTemplate, processImportFile, finalizeImport,
    isImporting, isExporting
  };
};