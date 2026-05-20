
export type MonthlyAttendanceSummary = {
  totalDays: number;
  present: number;
  wfh: number;
  halfDay: number;
  pending: number;
  rejected: number;
  attendancePercentage: number;
};
