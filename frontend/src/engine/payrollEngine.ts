import { calculatePF } from "./pfCalculator";
import { calculateProfessionalTax } from "./taxCalculator";
import type { PayrollCalculationInput } from "../type/payroll.types";

export function calculatePayrollStructure({
  gross,
  limitPF,
  config,
}: PayrollCalculationInput) {
  const basic = gross * (config.basicPercentage / 100);

  const hra = basic * (config.hraPercentage / 100);

  const da = gross * (config.daPercentage / 100);

  const special = gross - basic - hra - da;

  const epf = calculatePF(basic, limitPF);

  const professionalTax = calculateProfessionalTax(gross);

  return {
    basic: Math.round(basic),
    hra: Math.round(hra),
    da: Math.round(da),
    special: Math.round(special),
    epf: Math.round(epf),
    professionalTax: Math.round(professionalTax),
  };
}