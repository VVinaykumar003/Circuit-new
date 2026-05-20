export function validateSalaryStructure({
  employeeId,
  monthlyGross,
}: {
  employeeId: string;
  monthlyGross: number;
}) {
  if (!employeeId) {
    return "Please select an employee";
  }

  if (monthlyGross <= 0) {
    return "Monthly gross salary must be greater than 0";
  }

  return null;
}