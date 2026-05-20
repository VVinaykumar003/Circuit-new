import { PROFESSIONAL_TAX } from "../constants/payroll.constants";

export function calculateProfessionalTax(gross: number) {
  return gross > 10000 ? PROFESSIONAL_TAX : 0;
}