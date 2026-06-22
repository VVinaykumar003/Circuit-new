interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected" | "Paid" | "Unpaid" | "generate" | "absent" | "present" | "not marked" | "half day" | string;
  size?: "sm" | "md";
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: "",
    className: "bg-warning text-white border-warning/30",
  },
  approved: {
    label: "Approved",
    icon: "",
    className: "bg-success text-white border-success/30",
  },
  absent: {
    label: "Absent",
    icon: "",
    className: "bg-error text-white border-error/30",
  },
  present: {
    label: "Present",
    icon: "",
    className: "bg-success/20 text-success border-success/30",
  },
  "not marked": {
    label: "Not Marked",
    icon: "",
    className: "bg-warning text-white  border-warning/30",
  },
  "half day": {
    label: "Half Day",
    icon: "",
    className: "bg-info/20 text-info border-info/30",
  },
  paid: {
    label: "Paid",
    icon: "",
    className: "bg-success text-white border-success/30",
  },
  unpaid: {
    label: "Unpaid",
    icon: "",
    className: "bg-error text-white border-error/30",
  },
  generated: {
    label :"Generate",
    icon : "",
    className: "bg-warning/20 text-warning border-warning/30"
  },
  rejected: {
    label :"rejected",
    icon : "",
    className: "bg-error text-white border-error/30"
  },
  

};

export default function StatusBadge({
  status,
  size = "sm",
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toLowerCase() as keyof typeof STATUS_CONFIG] || {
    label: status,
    icon: "",
    className: "bg-base-200 text-base-content border-base-300",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full border
        ${size === "sm" ? "px-4 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        font-medium
        ${config.className}
      `}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
