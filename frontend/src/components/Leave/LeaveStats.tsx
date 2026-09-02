import {
  MdEventNote,
  MdHourglassEmpty,
  MdCheckCircle,
  MdCancel,
  MdCalendarToday,
} from "react-icons/md";
import type { LeaveRequest } from "@/type/leave";
import { StatsGrid } from "@/components/common";

interface Props {
  requests: LeaveRequest[];
}

export default function LeaveStats({ requests }: Props) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  // This month calculation
  const currentMonth = new Date().getMonth();
  const thisMonth = requests.filter((r) => {
    const date = new Date(r.fromDate);
    return date.getMonth() === currentMonth;
  }).length;

  return (
    <StatsGrid
      columns={{ default: 2, sm: 3, md: 3, lg: 5 }}
      stats={[
        {
          label: "Total Leaves",
          value: total,
          icon: <MdEventNote size={18} />,
          color: "text-primary",
        },
        {
          label: "Pending",
          value: pending,
          icon: <MdHourglassEmpty size={18} />,
          color: "text-warning",
        },
        {
          label: "Approved",
          value: approved,
          icon: <MdCheckCircle size={18} />,
          color: "text-success",
        },
        {
          label: "Rejected",
          value: rejected,
          icon: <MdCancel size={18} />,
          color: "text-error",
        },
        {
          label: "This Month",
          value: thisMonth,
          icon: <MdCalendarToday size={18} />,
          color: "text-info",
        },
      ]}
    />
  );
}