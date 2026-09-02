import StatusBadge from "@/components/ui/StatusBadge";
import type { LeaveRequest } from "@/type/leave";
import {
  MdBeachAccess,
  MdSick,
  MdWork,
  MdTimelapse,
  MdCalendarToday,
  MdVisibility,
  MdDelete,
  MdEventBusy,
  MdAttachFile,
} from "react-icons/md";


interface Props {
  requests: LeaveRequest[];
  onView: (leave: LeaveRequest) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICON = {
  casual: MdBeachAccess,
  sick: MdSick,
  paid: MdWork,
  "half-day": MdTimelapse,
};

export default function LeaveCards({
  requests,
  onView,
  onDelete,
}: Props) {
  const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-base-100 border border-base-300 rounded-2xl border-dashed">
        <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4 text-base-content/40">
          <MdEventBusy size={30} />
        </div>
        <h3 className="text-lg font-medium text-base-content mb-1">
          No Leave Requests
        </h3>
        <p className="text-sm text-base-content/60 max-w-sm text-center">
          You haven't applied for any leaves yet. When you do, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((leave) => {
     const Icon =
  TYPE_ICON[leave.type as keyof typeof TYPE_ICON] || MdCalendarToday;

        return (
          <div onClick={() => onView(leave)}
            key={leave.id}
            className="cursor-pointer bg-primary/10 border border-primary rounded-xl p-3 shadow-sm hover:shadow-md transition"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1">
                <Icon size={15} className="text-primary" />
                <span className="font-semibold capitalize text-sm text-primary">
                  {leave.type.replace("-", " ")} Leave
                </span>
              </div>

              <StatusBadge status={leave.status} />
            </div>

            {/* DATE */}
            <div className="flex items-center gap-1 mt-3 text-xs text-base-content/50 font-medium">
              <MdCalendarToday size={15} />
              <span>
                {formatDate(leave.fromDate)}
                {leave.toDate && ` - ${formatDate(leave.toDate)}`}
              </span>
            </div>

            {/* REASON */}
             <div className="flex items-center gap-1 mt-3 text-sm text-base-content/50 font-medium">
             <span className="text-base-content/80">Reason : </span>
            <p className=" text-sm line-clamp-2 font-semibold">
              {leave.reason}
            </p>
            </div>

            {/* ATTACHMENTS BADGE */}
            {leave.attachments && leave.attachments.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                <MdAttachFile size={13} />
                <span>
                  {leave.attachments.length} attachment{leave.attachments.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => onView(leave)}
                className="btn btn-xs btn-primary"
              >
                <MdVisibility size={15} />
                View
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(leave.id);
                }}
                className="btn btn-xs btn-error "
              >
                <MdDelete size={15} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}