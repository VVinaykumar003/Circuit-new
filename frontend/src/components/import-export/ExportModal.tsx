import React, { useState } from 'react';
import { MdClose, MdFileDownload } from 'react-icons/md';
import type { ColumnConfig, ExportFormat, ExportScope } from '@/type/importExport.types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onExport: (format: ExportFormat, scope: ExportScope, selectedCols: string[]) => void;
  hasSelection: boolean;
}

export default function ExportModal({ isOpen, onClose, columns, onExport, hasSelection }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>('all');
  const [selectedCols, setSelectedCols] = useState<string[]>(columns.map(c => c.key));

  if (!isOpen) return null;

  const handleToggleCol = (key: string) => {
    if (selectedCols.includes(key)) setSelectedCols(selectedCols.filter(c => c !== key));
    else setSelectedCols([...selectedCols, key]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h3 className="font-bold text-lg flex items-center gap-2"><MdFileDownload size={20}/> Export Data</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle"><MdClose size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scope */}
          <div>
            <label className="text-xs font-bold uppercase text-base-content/50 mb-2 block">Export Scope</label>
            <div className="flex gap-4">
              <label className="cursor-pointer flex items-center gap-2">
                <input type="radio" className="radio radio-sm radio-primary" checked={scope === 'all'} onChange={() => setScope('all')} />
                <span className="text-sm font-medium">All Records</span>
              </label>
              <label className="cursor-pointer flex items-center gap-2">
                <input type="radio" className="radio radio-sm radio-primary" checked={scope === 'filtered'} onChange={() => setScope('filtered')} />
                <span className="text-sm font-medium">Filtered Results</span>
              </label>
              <label className={`cursor-pointer flex items-center gap-2 ${!hasSelection ? 'opacity-50' : ''}`}>
                <input type="radio" className="radio radio-sm radio-primary" disabled={!hasSelection} checked={scope === 'selected'} onChange={() => setScope('selected')} />
                <span className="text-sm font-medium">Selected Only</span>
              </label>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-xs font-bold uppercase text-base-content/50 mb-2 block">Export Format</label>
            <div className="flex gap-4">
              {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map(f => (
                <label key={f} className="cursor-pointer flex items-center gap-2">
                  <input type="radio" className="radio radio-sm radio-primary" checked={format === f} onChange={() => setFormat(f)} />
                  <span className="text-sm font-medium uppercase">{f}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase text-base-content/50">Columns to Export</label>
              <button onClick={() => setSelectedCols(columns.map(c => c.key))} className="text-xs text-primary hover:underline font-semibold">Select All</button>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-base-200/50 p-4 rounded-xl border border-base-200 max-h-48 overflow-y-auto">
              {columns.map(col => (
                <label key={col.key} className="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" className="checkbox checkbox-xs checkbox-primary rounded" checked={selectedCols.includes(col.key)} onChange={() => handleToggleCol(col.key)} />
                  <span className="text-sm truncate">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-base-200 bg-base-50 flex justify-end gap-2 mt-auto">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary gap-2" 
            disabled={selectedCols.length === 0}
            onClick={() => { onExport(format, scope, selectedCols); onClose(); }}
          >
            <MdFileDownload size={18}/> Download File
          </button>
        </div>
      </div>
    </div>
  );
}