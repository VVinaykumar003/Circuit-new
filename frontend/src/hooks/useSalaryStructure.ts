import { useEffect, useState } from "react";
import { calculatePayrollStructure } from "../engine/payrollEngine";
import { DEFAULT_PAYROLL_CONFIG } from "../constants/payroll.constants";

export function useSalaryStructure(monthlyGross: number, limitPF: boolean) {
  const [salaryData, setSalaryData] = useState({
    basic: 0,
    da: 0,
    hra: 0,
    special: 0,
    epf: 0,
    professionalTax: 0,
    customEarnings: [],
    customDeductions: [],
  });

  const [globalConfig, setGlobalConfig] = useState(
    DEFAULT_PAYROLL_CONFIG
  );

  useEffect(() => {
    if (!monthlyGross) return;

    const calculated = calculatePayrollStructure({
      gross: monthlyGross,
      limitPF,
      config: globalConfig,
    });

    setSalaryData((prev) => ({
      ...prev,
      ...calculated,
    }));
  }, [monthlyGross, limitPF, globalConfig]);

  return {
    salaryData,
    setSalaryData,
    globalConfig,
    setGlobalConfig,
  };
}