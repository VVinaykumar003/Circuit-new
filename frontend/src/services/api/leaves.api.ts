import { API } from "./axios";

export const applyLeave = (slug: string, leaveData: any) => API.post(`/${slug}/leaves/apply`, leaveData);
export const getMyLeaves = (slug: string) => API.get(`/${slug}/leaves/my`);
export const cancelLeave = (slug: string, leaveId: string) => API.patch(`/${slug}/leaves/${leaveId}/cancel`);
export const deleteLeave = (slug: string, leaveId: string) => API.delete(`/${slug}/leaves/${leaveId}`);
export const updateLeave = (slug: string, leaveId: string, leaveData: any) => API.put(`/${slug}/leaves/${leaveId}`, leaveData);
export const getAllLeaves = (slug: string, params?: any) => API.get(`/${slug}/leaves/all`, { params });
export const getLeaveById = (slug: string, leaveId: string) => API.get(`/${slug}/leaves/${leaveId}`);
export const updateLeaveStatus = (slug: string, leaveId: string, statusData: any) => API.patch(`/${slug}/leaves/${leaveId}/status`, statusData);
export const bulkUpdateLeaveStatus = (slug: string, data: any) => API.patch(`/${slug}/leaves/bulk-status`, data);

export const getLeavePolicies = (slug: string) => API.get(`/${slug}/leave-policies`);
export const createLeavePolicy = (slug: string, policyData: any) => API.post(`/${slug}/leave-policies`, policyData);
export const updateLeavePolicy = (slug: string, policyId: string, policyData: any) => API.put(`/${slug}/leave-policies/${policyId}`, policyData);
export const deleteLeavePolicy = (slug: string, policyId: string) => API.delete(`/${slug}/leave-policies/${policyId}`);

export const getHolidays = (slug: string) => API.get(`/${slug}/holidays`);
export const createHoliday = (slug: string, holidayData: any) => API.post(`/${slug}/holidays`, holidayData);
export const updateHoliday = (slug: string, holidayId: string, holidayData: any) => API.put(`/${slug}/holidays/${holidayId}`, holidayData);
export const deleteHoliday = (slug: string, holidayId: string) => API.delete(`/${slug}/holidays/${holidayId}`);
