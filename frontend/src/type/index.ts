export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Half Day"
  | "Leave"
  | "Holiday"
  | "Work From Home"
  | "Not Checked In"
  | "On Break"
  |"Pending"
  |"PRESENT"
  |"ABSENT"
  |"PENDING";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" |"all" | "approved" | "pending" | "absent";

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm AM/PM
  checkOut: string | null; // HH:mm AM/PM
  workingHours: string; // HH:mm
  totalBreak: string; // HH:mm
  status: AttendanceStatus;
  approval: ApprovalStatus;
  lateBy: string | null; // HH:mm
  earlyLeaving: string | null; // HH:mm
  location: string | null;
  device: string | null;
  browser: string | null;
  ipAddress: string | null;
  gps: {
    lat: number;
    lng: number;
  } | null;
  remarks: string | null;
}

export interface TodayAttendance {
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  totalBreak: string; // HH:mm
  workingHours: string; // HH:mm (live timer)
  location: string | null;
  isOnBreak: boolean;
  device: string | null;
  ipAddress: string | null;
  gps: {
    lat: number;
    lng: number;
  } | null;
  breaks:Break[];
}

export interface Break {
  start: string; // HH:mm AM/PM
  end: string | null; // HH:mm AM/PM
  duration: string; // HH:mm
  location: string | null;
  device: string | null;
  ipAddress: string | null;
  gps: {
    lat: number;
    lng: number;
  } | null;
}


export interface TodaySummaryData {
  workingHours: number;
  lateBy: number | null;
  overtime: number;
  totalBreak: number;
  status: AttendanceStatus;
}

export interface EmployeeDetails {
  name: string;
  id: string;
  department: string;
  designation: string;
  profileImageUrl: string;
}

export interface EmployeeDashboardData {
  employeeDetails: EmployeeDetails;
  today: TodayAttendance;
  summary: TodaySummaryData;
  monthlyRecords: AttendanceRecord[]; // For calendar
}

// For Admin Approval Tab
export interface AdminApprovalRecord {
  _id: string;
  attendanceDocId: string; // Added this property to resolve the TypeScript error
  employeeId: string;
  employeeName: string;
  profileImageUrl?: string;
  checkIn?: string;
  checkOut?: string;
  workingHours: number; // Assuming number based on usage and sample data
  late?: number; // Assuming number based on sample data
  location?: string;
  status: AttendanceStatus;
  approval: ApprovalStatus;
}

export interface AdminDashboardData {
  kpis: {
    presentToday: number;
    absentToday: number;
    lateEmployees: number;
    pendingApprovals: number;
    onLeave: number;
    workFromHome: number;
  };
  approvals: AdminApprovalRecord[];
}