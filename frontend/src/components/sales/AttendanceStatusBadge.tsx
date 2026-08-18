import type { AttendanceStatus } from "../types/attendance";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  Present: "badge-success",
  Absent: "badge-error",
  Leave: "badge-info",
  "Half Day": "badge-warning",
  Holiday: "badge-secondary",
  WFH: "badge-accent",
};

export default function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`badge ${STATUS_STYLES[status]} badge-sm font-medium gap-1 whitespace-nowrap`}>
      {status}
    </span>
  );
}
