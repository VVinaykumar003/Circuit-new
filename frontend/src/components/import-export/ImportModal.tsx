import React, { useState, useRef } from 'react';
import { MdClose, MdUploadFile, MdCloudUpload, MdWarning, MdCheckCircle, MdError } from 'react-icons/md';
import type { ImportResult, ImportOptions } from '@/type/importExport.types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessFile: (file: File) => Promise<ImportResult | null>;
  onConfirmImport: (validRows: any[], options: ImportOptions) => Promise<void>;
  onDownloadTemplate: () => void;
}

export default function ImportModal({ isOpen, onClose, onProcessFile, onConfirmImport, onDownloadTemplate }: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [options, setOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    updateExisting: false,
    validateBeforeImport: true,
  });

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) return;
    setFile(selectedFile);
    setIsProcessing(true);
    const res = await onProcessFile(selectedFile);
    setResult(res);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = async () => {
    if (result && result.validRows.length > 0) {
      setIsProcessing(true);
      try {
        await onConfirmImport(result.validRows, options);
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h3 className="font-bold text-lg flex items-center gap-2"><MdUploadFile size={20}/> Import Data</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle"><MdClose size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {!file ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-base-300 rounded-2xl p-10 text-center hover:bg-base-200/50 transition-colors cursor-pointer flex flex-col items-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <MdCloudUpload size={48} className="text-primary/50 mb-3" />
                <p className="font-bold text-base-content mb-1">Click or drag file to this area to upload</p>
                <p className="text-xs text-base-content/60">Support for a single CSV or XLSX file.</p>
                <input type="file" className="hidden" accept=".csv,.xlsx" ref={fileInputRef} onChange={(e) => e.target.files && handleSelectFile(e.target.files[0])} />
              </div>
              <div className="text-center">
                <button className="btn btn-link btn-sm text-primary" onClick={onDownloadTemplate}>Download Import Template</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-base-200/50 p-4 rounded-xl border border-base-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{file.name}</p>
                  <p className="text-xs text-base-content/60">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button className="btn btn-xs btn-ghost text-error" onClick={handleReset}>Remove</button>
              </div>

              {isProcessing && (
                <div className="flex flex-col items-center py-6 gap-3">
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                  <p className="text-sm font-semibold">Processing Data...</p>
                </div>
              )}

              {!isProcessing && result && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-base-200 p-3 rounded-xl border border-base-300">
                      <p className="text-xs font-bold uppercase text-base-content/50">Total Rows</p>
                      <p className="text-xl font-bold">{result.totalProcessed}</p>
                    </div>
                    <div className="bg-success/10 p-3 rounded-xl border border-success/20">
                      <p className="text-xs font-bold uppercase text-success">Valid Rows</p>
                      <p className="text-xl font-bold text-success flex justify-center items-center gap-1"><MdCheckCircle/>{result.validRows.length}</p>
                    </div>
                    <div className="bg-error/10 p-3 rounded-xl border border-error/20">
                      <p className="text-xs font-bold uppercase text-error">Invalid Rows</p>
                      <p className="text-xl font-bold text-error flex justify-center items-center gap-1"><MdError/>{result.invalidRows.length}</p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="border border-error/20 rounded-xl overflow-hidden mt-4">
                      <div className="bg-error/10 px-4 py-2 font-bold text-sm text-error flex items-center gap-2"><MdWarning/> Validation Errors Found</div>
                      <div className="max-h-48 overflow-y-auto">
                        <table className="table table-xs w-full">
                          <thead className="bg-base-200 sticky top-0">
                            <tr><th>Row</th><th>Field</th><th>Error</th></tr>
                          </thead>
                          <tbody>
                            {result.errors.map((err, i) => (
                              <tr key={i}>
                                <td className="font-mono text-base-content/60">Row {err.row}</td>
                                <td className="font-semibold">{err.field}</td>
                                <td className="text-error">{err.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-base-200 bg-base-50 flex justify-end gap-2 mt-auto">
          <button className="btn btn-ghost" onClick={onClose} disabled={isProcessing}>Cancel</button>
          <button className="btn btn-primary gap-2" disabled={!result || result.validRows.length === 0 || isProcessing} onClick={handleConfirm}>
            {isProcessing ? <span className="loading loading-spinner loading-xs"></span> : <MdUploadFile size={18}/>}
            Import {result?.validRows.length || 0} Records
          </button>
        </div>
      </div>
    </div>
  );
}