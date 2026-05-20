import {
  MdEventNote,
  MdHourglassEmpty,
  MdCheckCircle,
  MdCancel,
  MdCalendarToday,
} from "react-icons/md";
import type { LeaveRequest } from "@/type/leave";

interface Props {
  requests: LeaveRequest[];
}

export default function LeaveStats({ requests }: Props) {
  const total = requests.length;
  const pending = requests.filter(
    (r) => r.status === "pending"
  ).length;
  const approved = requests.filter(
    (r) => r.status === "approved"
  ).length;
  const rejected = requests.filter(
    (r) => r.status === "rejected"
  ).length;

  // This month calculation
  const currentMonth = new Date().getMonth();
  const thisMonth = requests.filter((r) => {
    const date = new Date(r.fromDate);
    return date.getMonth() === currentMonth;
  }).length;

  const stats = [
    {
      title: "Total Leaves",
      value: total,
      icon: MdEventNote,
      color: "text-primary",
    },
    {
      title: "Pending",
      value: pending,
      icon: MdHourglassEmpty,
      color: "text-warning",
    },
    {
      title: "Approved",
      value: approved,
      icon: MdCheckCircle,
      color: "text-success",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: MdCancel,
      color: "text-error",
    },
    {
      title: "This Month",
      value: thisMonth,
      icon: MdCalendarToday,
      color: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-primary p-4 rounded-2xl">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-sm hover:shadow-md transition "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60 font-medium">
                  {stat.title}
                </p>
                <p className="text-xl text-base-content font-semibold">
                  {stat.value}
                </p>
              </div>

              <Icon
                size={26}
                className={`${stat.color}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}