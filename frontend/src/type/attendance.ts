// export type AttendanceStatus = "pending" | "approved" | "absent";

export type AttendanceRecord = {
  id: string;
  employee: string;
  date: string;
  checkIn: string;
  status: AttendanceStatus;
};

export type UserRole = "admin" | "employee" | "owner";

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Half Day"
  | "Leave"
  | "Holiday"
  | "WFH";

export interface Attendance {
  imageUrl:string,
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  profileImage: string;
  date: string; // ISO date, e.g. "2026-07-14"
  checkIn: string; // "09:04 AM"
  checkOut: string; // "06:12 PM"
  totalHours: number;
  overtimeHours: number;
  breakHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status: "PRESENT" | "PENDING";
  approval?: "Pending" | "Approved" | "Rejected";  shift: string;
  remarks?: string;
  location?: string;
  device?: string;
  email:string;
}

export interface AttendanceFilters {
  search: string;
  startDate: string | null;
  endDate: string | null;
  month: string | null; // "2026-07"
  status: AttendanceStatus | "All";
  shift: string | "All";
  department?: string | "All";
  designation?: string | "All";
}

export const defaultAttendanceFilters: AttendanceFilters = {
  search: "",
  startDate: null,
  endDate: null,
  month: null,
  status: "All",
  shift: "All",
  department: "All",
  designation: "All",
};

export interface AttendanceStats {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateEntries: number;
  overtimeHours: number;
  avgWorkingHours: number;
}

export interface AdminAttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateEmployees: number;
  onLeave: number;
  avgWorkingHours: number;
  totalOvertime: number;
  attendancePercentage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// export interface AdminDashboardData {
//   kpis: AdminKpis;

//   approvals: AdminApproval[];

//   employees: AdminEmployee[];
// }