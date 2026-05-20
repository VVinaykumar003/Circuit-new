import type { SalaryStructure } from "@/type/payslip";

export function calculateSalary(structure: SalaryStructure) {
  const gross =
    structure.basic +
    structure.hra +
    structure.allowances +
    structure.bonus;

  const totalDeductions = structure.deductions;

  const netPay = gross - totalDeductions;

  return {
    gross,
    totalDeductions,
    netPay,
  };
}
