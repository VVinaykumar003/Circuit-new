import React, { useState } from 'react';
import { MdFileDownload, MdFileUpload } from 'react-icons/md';
import type { ColumnConfig } from '@/type/importExport.types'
import { useImportExport } from '@/hooks/useImportExport';
import ImportModal from './ImportModal';
import ExportModal from './ExportModal';

export interface ImportExportActionsProps {
  moduleName: string;
  columns: ColumnConfig[];
  data: any[]; // All currently loaded/filtered data
  selectedData?: any[]; // Subset of data selected by checkboxes
  onImportSubmit?: (validData: any[]) => Promise<void>; // Function to save data to backend
}

export default function ImportExportActions({ moduleName, columns, data, selectedData = [], onImportSubmit }: ImportExportActionsProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { triggerExport, downloadTemplate, processImportFile, finalizeImport } = useImportExport(moduleName, columns);

  const handleExportSubmit = (format: any, scope: any, selectedCols: string[]) => {
    let targetData = data;
    if (scope === 'selected' && selectedData.length > 0) targetData = selectedData;
    // If API pagination is used, "All" might require a separate API call in the parent component.
    triggerExport(targetData, format, selectedCols);
  };

  const handleConfirmImport = async (validRows: any[], options: any) => {
    if (onImportSubmit) {
      await finalizeImport(validRows, options, onImportSubmit);
    } else {
      console.warn("No onImportSubmit handler provided. Data:", validRows);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setIsImportOpen(true)} className="btn btn-outline btn-sm gap-2 bg-base-100">
          <MdFileUpload size={16} /> Import {moduleName}
        </button>
        <button onClick={() => setIsExportOpen(true)} className="btn btn-outline btn-sm gap-2 bg-base-100">
          <MdFileDownload size={16} /> Export
        </button>
      </div>

      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onProcessFile={processImportFile}
        onConfirmImport={handleConfirmImport}
        onDownloadTemplate={downloadTemplate}
      />
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        columns={columns} 
        onExport={handleExportSubmit} 
        hasSelection={selectedData.length > 0} 
      />
    </>
  );
}