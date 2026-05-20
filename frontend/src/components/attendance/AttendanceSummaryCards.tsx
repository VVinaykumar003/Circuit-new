import type {MonthlyAttendanceSummary} from "../../type/MonthlyAttendanceSummary";

interface Props {
  summary: MonthlyAttendanceSummary;
}

export default function AttendanceSummaryCards({ summary }: Props) {
  const items = [
    { label: "Working Days", value: summary.totalDays },
    { label: "Present", value: summary.present },
    { label: "WFH", value: summary.wfh },
    { label: "Half Day", value: summary.halfDay, },
    { label: "Pending", value: summary.pending,  },
    { label: "Rejected", value: summary.rejected },
    {
      label: "Attendance %",
      value: `${summary.attendancePercentage}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`bg-base-100 border shadow-md border-base-300 rounded-lg p-4 text-center
          ${item.highlight ? "ring-1 ring-warning" : ""}`}
        >
          <p className="text-sm font-bold text-base-content/80">
            {item.label}
          </p>
          <p className="text-2xl font-semibold text-base-content mt-1">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
