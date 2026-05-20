import API from "../api/axios";

export const getMySalarySlips = (slug: string, params?: any) => {
  return API.get(`/salary-slip/${slug}/my`, { params });
};

export const getAllSalarySlips = (slug: string, params?: any) => {
  return API.get(`/salary-slip/${slug}`, { params });
};

export const getSalarySlipById = (slug: string, payrollId: string) => {
  return API.get(`/salary-slip/${slug}/${payrollId}`);
};

export const downloadSalarySlipPDF = (slug: string, payrollId: string) => {
  // responseType: 'blob' is mandatory for successfully receiving PDF files
  return API.get(`/salary-slip/${slug}/${payrollId}/pdf`, {
    responseType: 'blob',
  });
};