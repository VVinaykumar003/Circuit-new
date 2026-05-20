export interface Employee {
  _id: string;
  name: string;
  email: string;
}

export interface CustomRow {
  id: string;
  label: string;
  amount: number;
}

export interface SalaryStructure {
  basic: number;
  da: number;
  hra: number;
  special: number;
  epf: number;
  professionalTax: number;
  customEarnings: CustomRow[];
  customDeductions: CustomRow[];
}

export interface GlobalPayrollConfig {
  basicPercentage: number;
  hraPercentage: number;
  daPercentage: number;
}

export interface PayrollCalculationInput {
  gross: number;
  limitPF: boolean;
  config: GlobalPayrollConfig;
}