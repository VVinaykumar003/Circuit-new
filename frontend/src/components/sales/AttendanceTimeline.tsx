import { Clock } from "lucide-react";
import type { Attendance } from "@/type/attendance";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

const DOT_COLOR: Record<Attendance["status"], string> = {
  Present: "bg-success",
  Absent: "bg-error",
  Leave: "bg-info",
  "Half Day": "bg-warning",
  Holiday: "bg-secondary",
  WFH: "bg-accent",
};

export default function AttendanceTimeline({
  records,
  onView,
}: {
  records: Attendance[];
  onView: (record: Attendance) => void;
}) {
  console.log(records);
  if (records.length === 0) {
    return <p className="text-center text-sm text-base-content/50 py-12">No records to show on the timeline.</p>;
  }

  return (
    <ol className="relative border-s-2 border-base-300 ms-3">
      {records.map((r) => (
        <li key={r.id} className="mb-6 ms-6">
          <span
            className={`absolute -start-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-base-100 ${DOT_COLOR[r.status]}`}
          />
          <button
            onClick={() => onView(r)}
            className="w-full text-left rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-semibold text-sm">
                {new Date(r.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                })}
              </p>
              <AttendanceStatusBadge status={r.status} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-base-content/60">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {r.checkIn} – {r.checkOut}
              </span>
              <span>{r.totalHours}h worked</span>
            </div>
          </button>
        </li>
      ))}
    </ol>
  );
}
