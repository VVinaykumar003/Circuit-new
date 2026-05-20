import { PF_LIMIT, PF_PERCENTAGE } from "../constants/payroll.constants";

export function calculatePF(basic: number, limitPF: boolean) {
  if (limitPF && basic > PF_LIMIT) {
    return PF_LIMIT * PF_PERCENTAGE;
  }

  return basic * PF_PERCENTAGE;
}