export type ValidationType = 'string' | 'number' | 'email' | 'phone' | 'date' | 'boolean';

export interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
  type?: ValidationType;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult<T = any> {
  validRows: T[];
  invalidRows: T[];
  errors: ValidationError[];
  totalProcessed: number;
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateBeforeImport?: boolean;
}

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ExportScope = 'all' | 'filtered' | 'selected';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  columns: string[]; // array of selected column keys
}

export interface ImportExportActionsProps {
  moduleName: string;
}