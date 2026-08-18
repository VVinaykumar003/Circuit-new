import axios from "axios";
import type {
  EmployeeDashboardData,
  TodayAttendance,
  AdminDashboardData,
  AttendanceRecord,
} from "@/type/index";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const attendanceApi = axios.create({
  baseURL: `${API_URL}/attendance`,
  withCredentials: true,
});

const adminApi = axios.create({
  baseURL: `${API_URL}/admin/attendance`,
  withCredentials: true,
});

// --- Employee Endpoints ---

export const getEmployeeDashboard = async (): Promise<EmployeeDashboardData> => {
  const { data } = await attendanceApi.get("/today");
  return data;
};

export const checkIn = async (location: {
  lat: number;
  lng: number;
}): Promise<TodayAttendance> => {
  const { data } = await attendanceApi.post("/check-in", { location });
  return data;
};

export const checkOut = async (): Promise<TodayAttendance> => {
  const { data } = await attendanceApi.post("/check-out");
  return data;
};

export const startBreak = async (
  breakType: string
): Promise<TodayAttendance> => {
  const { data } = await attendanceApi.post("/start-break", { breakType });
  return data;
};

export const endBreak = async (): Promise<TodayAttendance> => {
  const { data } = await attendanceApi.post("/end-break");
  return data;
};

export const getAttendanceHistory = async (
  filters: any
): Promise<AttendanceRecord[]> => {
  const { data } = await attendanceApi.get("/history", { params: filters });
  return data;
};

export const applyRegularization = async (
  formData: FormData
): Promise<void> => {
  await attendanceApi.post("/regularization", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Admin Endpoints ---

export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const { data } = await adminApi.get("/");
  return data;
};

export const approveAttendance = async (slug: string, attendanceId: string, data: any): Promise<void> => {
  await API.put(`/${slug}/attendance/approve/${attendanceId}`, data);
};

export const rejectAttendance = async (slug: string, attendanceId: string, data: any): Promise<void> => {
  // Reusing the same endpoint for rejection, just with a different status
  await API.put(`/${slug}/attendance/approve/${attendanceId}`, data);
};