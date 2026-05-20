import StatusBadge from "../ui/StatusBadge";


type AttendanceHistoryItem = {
  id: string;
  date: string;
  mode: "office" | "wfh" | "half-day";
  status: "approved" | "pending" | "rejected";
  reason?: string;
  approvedBy?: string;
};
interface Props {
  history: AttendanceHistoryItem[];
}

export default function AttendanceTimeline({ history }: Props) {
  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className="relative pl-6 border-l border-base-300"
        >
          {/* Dot */}
          <span className="absolute -left-2 top-2 w-3 h-3 rounded-full 
            bg-primary"></span>

          <div className="bg-base-100 border border-base-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="font-medium text-base-content">
                {item.date}
              </p>
              <StatusBadge status={item.status} />
            </div>

            <p className="text-sm text-base-content/60 mt-1">
              Mode: <strong>{item.mode}</strong>
            </p>

            {item.reason && (
              <p className="text-sm mt-2">
                📝 {item.reason}
              </p>
            )}

            {item.approvedBy && (
              <p className="text-xs text-base-content/50 mt-1">
                Approved by {item.approvedBy}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
