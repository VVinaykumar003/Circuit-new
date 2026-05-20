export type SalaryStructure = {
  id: string;
  name: string;
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  deductions: number;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  salaryStructureId: string;
};

export type Payslip = {
  id: string;
  employeeId: string;
  month: string; // 2026-02
  gross: number;
  totalDeductions: number;
  netPay: number;
};

export type PayrollStatus = "generated" | "paid" | "cancelled";

export interface PayrollRecord {
  id: string;
  employeeName: string;
  role: string;
  month: string; // 2026-02
  gross: number;
  deductions: number;
  netPay: number;
  generatedOn: string;
  status: PayrollStatus;
}
