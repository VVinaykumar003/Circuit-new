// import API from "../api/axios";

// /**
//  * Fetches the logged-in employee's payroll records.
//  * @param {string} slug - The organization slug.
//  * @param {object} params - Query parameters (month, year, page, limit).
//  * @returns {Promise} Axios promise.
//  */
// export const getMyPayroll = (slug: any, params?: any) => {
//   return API.get(`/payroll/${slug}/my`, { params });
// };

// /**
//  * Generates payroll for a single employee or all active employees (Admin/Manager).
//  * @param {string} slug - The organization slug.
//  * @param {object} data - Payroll generation data { employeeId, month, year, basicSalary, ... }.
//  * @returns {Promise} Axios promise.
//  */
// export const generatePayroll = (slug: any, data: any) => {
//   return API.post(`/payroll/${slug}/generate`, data);
// };

// /**
//  * Fetches all payroll records for the organization (Admin/Manager).
//  * @param {string} slug - The organization slug.
//  * @param {object} params - Query parameters (month, year, employeeId, status, page, limit).
//  * @returns {Promise} Axios promise.
//  */
// export const getAllPayroll = (slug: any, params?: any) => {
//   return API.get(`/payroll/${slug}`, { params });
// };

// /**
//  * Updates an existing PENDING payroll record (Admin/Manager).
//  * @param {string} slug - The organization slug.
//  * @param {string} id - The payroll record ID.
//  * @param {object} data - Updated salary data { basicSalary, allowances, deductions, bonus }.
//  * @returns {Promise} Axios promise.
//  */
// export const updatePayroll = (slug: any, id: any, data: any) => {
//   return API.put(`/payroll/${slug}/${id}`, data);
// };

// /**
//  * Approves a PENDING payroll record, changing status to PROCESSED (Admin/Manager).
//  * @param {string} slug - The organization slug.
//  * @param {string} id - The payroll record ID.
//  * @returns {Promise} Axios promise.
//  */
// export const approvePayroll = (slug: any, id: any) => {
//   return API.put(`/payroll/${slug}/${id}/approve`);
// };

// /**
//  * Marks a PROCESSED payroll record as PAID (Admin/Manager).
//  * @param {string} slug - The organization slug.
//  * @param {string} id - The payroll record ID.
//  * @returns {Promise} Axios promise.
//  */
// export const payPayroll = (slug: any, id: any) => {
//   return API.put(`/payroll/${slug}/${id}/pay`);
// };

import API from "../api/axios";
import api from "./api";

const BASE_PATH = "payroll";

// ==========================================
// Company Policy Routes
// ==========================================

export const getPolicy = (slug: string) => {
  return API.get(`/${BASE_PATH}/${slug}/policy`);
};

export const updatePolicy = (slug: string, policyData: any) => {
  return API.post(`/${BASE_PATH}/${slug}/policy`, policyData);
};

// ==========================================
// Dashboard & Summary Routes
// ==========================================

export const getSummary = (slug: string) => {
  return API.get(`/payroll/${slug}/summary`);
};

export const getStats = (slug: string) => {
  return API.get(`/payroll/${slug}/stats`);
};

export const getEmployees = (slug: string) => {
  return API.get(`/payroll/${slug}/employees`);
};

// ==========================================
// Salary Structure Setup
// ==========================================

export const setStructure = (slug: string, structureData: any) => {
  return API.post(`/${BASE_PATH}/${slug}/structure`, structureData);
};

export const getStructure = (slug: string, employeeId: string) => {
  return API.get(`/${BASE_PATH}/${slug}/structure/${employeeId}`);
};

// ==========================================
// Monthly Payroll Processing
// ==========================================

export const runMonthly = (slug: string, payrollData: any) => {
  return API.post(`/${BASE_PATH}/${slug}/run`, payrollData);
};

export const getMonthlyList = (
  slug: string,
  params?: { month?: number; year?: number }
) => {
  return API.get(`/payroll/${slug}/monthly`, { params });
};

export const deleteDraft = (slug: string, payrollId: string) => {
  return API.delete(`/${BASE_PATH}/${slug}/draft/${payrollId}`);
};

// ==========================================
// Individual Payroll Slip Management
// ==========================================

export const getSlipDetails = (slug: string, slipId: string) => {
  return API.get(`/${BASE_PATH}/${slug}/slip/${slipId}`);
};

export const markSlipPaid = (
  slug: string,
  slipId: string,
  paymentData: any
) => {
  return API.patch(
    `/${BASE_PATH}/${slug}/slip/${slipId}/mark-paid`,
    paymentData
  );
};

export const downloadSlipPdf = async (
  slug: string,
  slipId: string
): Promise<Blob> => {
  const response = await API.get(
    `/${BASE_PATH}/${slug}/slip/${slipId}/download`,
    { responseType: "blob" }
  );
  return response.data;
};

// ==========================================
// Employee Self-Service Route
// ==========================================

export const getMyHistory = (slug: string) => {
  return API.get(`/${BASE_PATH}/${slug}/my-history`);
};





export const getPayrollConfig = async (slug: string) => {
  return API.get(`/${BASE_PATH}/${slug}/config`);
};

export const updatePayrollConfig = async (
  slug: string,
  data: any
) => {
  return API.patch(
    `/${BASE_PATH}/${slug}/config`,
    data
  );
};