import { getStructure, setStructure } from "@/services/payrollService";

export async function fetchSalaryStructure(
  slug: string,
  employeeId: string
) {
  const res = await getStructure(slug, employeeId);

  return res.data?.data || res.data;
}

export async function saveSalaryStructure(
  slug: string,
  payload: any
) {
  return await setStructure(slug, payload);
}