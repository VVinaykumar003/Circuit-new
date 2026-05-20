export type AttendanceStatus = "pending" | "approved" | "absent";

export type AttendanceRecord = {
  id: string;
  employee: string;
  date: string;
  checkIn: string;
  status: AttendanceStatus;
};

export type UserRole = "admin" | "employee" | "owner";
