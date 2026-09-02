import { API } from "./axios";

const BASE_PATH = "payroll";

export const getPolicy = (slug: string) => API.get(`/${BASE_PATH}/${slug}/policy`);
export const updatePolicy = (slug: string, policyData: any) => API.post(`/${BASE_PATH}/${slug}/policy`, policyData);

export const getSummary = (slug: string) => API.get(`/payroll/${slug}/summary`);
export const getStats = (slug: string) => API.get(`/payroll/${slug}/stats`);
export const getEmployees = (slug: string) => API.get(`/payroll/${slug}/employees`);

export const setStructure = (slug: string, structureData: any) => API.post(`/${BASE_PATH}/${slug}/structure`, structureData);
export const getStructure = (slug: string, employeeId: string) => API.get(`/${BASE_PATH}/${slug}/structure/${employeeId}`);

export const runMonthly = (slug: string, payrollData: any) => API.post(`/${BASE_PATH}/${slug}/run`, payrollData);
export const getMonthlyList = (slug: string, params?: { month?: number; year?: number }) => API.get(`/payroll/${slug}/monthly`, { params });
export const deleteDraft = (slug: string, payrollId: string) => API.delete(`/${BASE_PATH}/${slug}/draft/${payrollId}`);

export const getSlipDetails = (slug: string, slipId: string) => API.get(`/${BASE_PATH}/${slug}/slip/${slipId}`);
export const markSlipPaid = (slug: string, slipId: string, paymentData: any) => API.patch(`/${BASE_PATH}/${slug}/slip/${slipId}/mark-paid`, paymentData);
export const downloadSlipPdf = async (slug: string, slipId: string): Promise<Blob> => {
  const response = await API.get(`/${BASE_PATH}/${slug}/slip/${slipId}/download`, { responseType: "blob" });
  return response.data;
};

export const getMyHistory = (slug: string) => API.get(`/${BASE_PATH}/${slug}/my-history`);
export const getPayrollConfig = async (slug: string) => API.get(`/${BASE_PATH}/${slug}/config`);
export const updatePayrollConfig = async (slug: string, data: any) => API.patch(`/${BASE_PATH}/${slug}/config`, data);
