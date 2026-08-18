import { Clock, Timer, MapPin, MoreVertical } from "lucide-react";
import type { Attendance } from "../../type/attendance";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

export default function AttendanceCard({
  record,
  onView,
  showEmployee,
}: {
  record: Attendance;
  onView: (record: Attendance) => void;
  showEmployee?: boolean;
}) {
  const day = new Date(record.date).toLocaleDateString("en-US", { weekday: "short" });
  const dateLabel = new Date(record.date).toLocaleDateString("en-US", { day: "2-digit", month: "short" });

  return (
    <button
      onClick={() => onView(record)}
      className="w-full text-left rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showEmployee && (
            <img
              src={record.profileImage}
              alt={record.employeeName}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
          <div>
            {showEmployee && <p className="text-sm font-semibold leading-tight">{record.employeeName}</p>}
            <p className="text-xs text-base-content/60">
              {day}, {dateLabel}
            </p>
          </div>
        </div>
        <AttendanceStatusBadge status={record.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className="flex flex-col">
          <span className="text-base-content/50">Check In</span>
          <span className="font-medium">{record.checkIn}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base-content/50">Check Out</span>
          <span className="font-medium">{record.checkOut}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base-content/50">Hours</span>
          <span className="font-medium">{record.totalHours}h</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-base-200 text-[11px] text-base-content/50">
        {record.lateMinutes > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {record.lateMinutes}m late
          </span>
        )}
        {record.overtimeHours > 0 && (
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3" /> {record.overtimeHours}h OT
          </span>
        )}
        {record.location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3" /> {record.location}
          </span>
        )}
        <MoreVertical className="w-3.5 h-3.5 ml-auto" />
      </div>
    </button>
  );
}
