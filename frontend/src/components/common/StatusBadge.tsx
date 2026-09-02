import React from "react";

export interface StatusBadgeProps {
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "paid"
    | "unpaid"
    | "generate"
    | "generated"
    | "absent"
    | "present"
    | "not marked"
    | "half day"
    | "in progress"
    | "completed"
    | "on hold"
    | "cancelled"
    | "active"
    | "inactive"
    | "low stock"
    | "out of stock"
    | string;
  size?: "sm" | "md";
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  approved: { label: "Approved", className: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", className: "bg-error/15 text-error border-error/30" },
  absent: { label: "Absent", className: "bg-error/15 text-error border-error/30" },
  present: { label: "Present", className: "bg-success/15 text-success border-success/30" },
  "not marked": { label: "Not Marked", className: "bg-warning/15 text-warning border-warning/30" },
  "half day": { label: "Half Day", className: "bg-info/15 text-info border-info/30" },
  paid: { label: "Paid", className: "bg-success/15 text-success border-success/30" },
  unpaid: { label: "Unpaid", className: "bg-error/15 text-error border-error/30" },
  generate: { label: "Generate", className: "bg-warning/15 text-warning border-warning/30" },
  generated: { label: "Generated", className: "bg-success/15 text-success border-success/30" },
  "in progress": { label: "In Progress", className: "bg-info/15 text-info border-info/30" },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/30" },
  "on hold": { label: "On Hold", className: "bg-warning/15 text-warning border-warning/30" },
  cancelled: { label: "Cancelled", className: "bg-error/15 text-error border-error/30" },
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  inactive: { label: "Inactive", className: "bg-base-300 text-base-content/60 border-base-300" },
  "low stock": { label: "Low Stock", className: "bg-warning/15 text-warning border-warning/30" },
  "out of stock": { label: "Out of Stock", className: "bg-error/15 text-error border-error/30" },
  urgent: { label: "Urgent", className: "bg-error/15 text-error border-error/30 font-bold" },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/30 font-semibold" },
  medium: { label: "Medium", className: "bg-info/15 text-info border-info/30" },
  low: { label: "Low", className: "bg-base-200 text-base-content/70 border-base-300" },
};

export default function StatusBadge({
  status,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const normalizedKey = (status || "").toLowerCase().trim();
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status,
    className: "bg-base-200 text-base-content/70 border-base-300",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border font-medium
        ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        ${config.className}
        ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0"></span>
      {config.label}
    </span>
  );
}
