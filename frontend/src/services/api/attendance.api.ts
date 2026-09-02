import { API } from "./axios";

export const getEmployeeDashboard = (slug: string) => API.get(`/${slug}/attendance/today`);
export const checkIn = (slug: string, data?: object) => API.post(`/${slug}/attendance/check-in`, data);
export const checkOut = (slug: string, data?: object) => API.post(`/${slug}/attendance/check-out`, data);
export const startBreak = (slug: string) => API.post(`/${slug}/attendance/start-break`);
export const endBreak = (slug: string) => API.post(`/${slug}/attendance/end-break`);
export const getAttendanceHistory = (slug: string, params?: object) => API.get(`/${slug}/attendance/history`, { params });
export const applyRegularization = (slug: string, data: object) => API.post(`/${slug}/attendance/regularization`, data);
export const getAdminDashboard = (slug: string) => API.get(`/${slug}/admin/`);
export const approveAttendance = (slug: string, attendanceId: string, data: object) => API.put(`/${slug}/attendance/approve/${attendanceId}`, data);
export const getAttendance = (slug: string, params?: object) => API.get(`/${slug}/attendance/organization`, { params });
export const getMyAttendance = (slug: string, params?: object) => API.get(`/${slug}/attendance/my`, { params });
export const getEmployeeAttendanceSummary = (slug: string, params?: object) => API.get(`/${slug}/attendance/summary`, { params });
export const getManagerDepartments = (slug: string) => API.get(`/${slug}/attendance/manager-departments`);
export const getDepartmentEmployees = (slug: string, departmentId?: string) => API.get(`/${slug}/attendance/department-employees`, { params: departmentId ? { departmentId } : {} });
export const getAllEmployees = (slug: string) => API.get(`/${slug}/attendance/all-employees`);
